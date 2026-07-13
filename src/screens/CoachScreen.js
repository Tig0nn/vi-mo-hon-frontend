import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { apiPost, apiPostFormData } from '../api/client';
import { colors } from '../theme/colors';
import { safeTextInputStyles } from '../theme/inputStyles';

const mascotImage = require('../../design-reference/ảnh Mascot.png');

const INITIAL_MESSAGES = [
  {
    id: 'coach-welcome',
    role: 'coach',
    text: 'Xin chào, tui là Mỏ Hỗn AI. Kể tui nghe món bạn đang phân vân hoặc khoản chi khiến bạn hơi tiếc nha.',
  },
];

const DEFAULT_SUGGESTIONS = [
  'Món này có đáng mua không?',
  'Tuần này tôi chi nhiều nhất vào đâu?',
  'Làm sao tiết kiệm thêm 50.000đ?',
  'Tôi đang bị FOMO sale, cản tôi lại',
];

const createMessageId = (role) => `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const VOICE_UPLOAD_TIMEOUT_MS = 25000;

function CoachAvatar() {
  return (
    <Image source={mascotImage} style={styles.avatarImage} resizeMode="cover" />
  );
}

export function CoachScreen({ userId }) {
  const scrollViewRef = useRef(null);
  const recordingRef = useRef(null);
  const mascotPulse = useRef(new Animated.Value(0)).current;
  const [coachMode, setCoachMode] = useState('text');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState(DEFAULT_SUGGESTIONS);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceLoading, setIsVoiceLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages, isSending]);

  const speakCoachReply = useCallback((text) => {
    try {
      Speech.stop();
      Speech.speak(text, {
        language: 'vi-VN',
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: (speechError) => {
          console.error('Unable to speak coach reply', speechError);
          setIsSpeaking(false);
        },
      });
    } catch (speechError) {
      console.error('Unable to speak coach reply', speechError);
      setIsSpeaking(false);
    }
  }, []);

  useEffect(() => {
    if (coachMode !== 'voice') {
      mascotPulse.stopAnimation();
      mascotPulse.setValue(0);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(mascotPulse, {
          duration: isVoiceLoading ? 650 : 1100,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(mascotPulse, {
          duration: isVoiceLoading ? 650 : 1100,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [coachMode, isVoiceLoading, mascotPulse]);

  useEffect(() => () => {
    Speech.stop();
    if (recordingRef.current) {
      recordingRef.current.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    }
  }, []);

  const sendMessage = async (rawMessage) => {
    const message = rawMessage.trim();

    if (!message || isSending) {
      return;
    }

    setError('');
    setInputText('');
    setIsSending(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: createMessageId('user'),
        role: 'user',
        text: message,
      },
    ]);

    try {
      const response = await apiPost('/api/coach/chat', {
        userId,
        message,
      });
      const reply = response?.data?.reply;

      if (!reply) {
        throw new Error('Missing coach reply');
      }

      setSuggestedQuestions(response?.data?.suggestedQuestions || DEFAULT_SUGGESTIONS);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId('coach'),
          role: 'coach',
          text: reply,
        },
      ]);
    } catch (chatError) {
      setError('Coach đang hơi lag, thử lại sau nha.');
    } finally {
      setIsSending(false);
    }
  };

  const startRecording = async () => {
    if (isVoiceLoading || isRecording) {
      return;
    }

    setError('');
    setTranscribedText('');

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Ứng dụng chưa có quyền micro. Vào Settings của điện thoại, bật Microphone cho Expo/Vi Mỏ Hỗn rồi thử lại.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (recordingError) {
      console.error('Unable to start voice recording', recordingError);
      setIsRecording(false);
      recordingRef.current = null;
      setError('Không thể bắt đầu ghi âm. Kiểm tra quyền micro rồi thử lại.');
    }
  };

  const uploadVoiceMessage = async (audioUri) => {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('audio', {
      uri: audioUri,
      name: `coach-voice-${Date.now()}.m4a`,
      type: 'audio/m4a',
    });

    return apiPostFormData('/api/coach/voice-message', formData, {
      timeoutMs: VOICE_UPLOAD_TIMEOUT_MS,
    });
  };

  const stopRecording = async () => {
    const recording = recordingRef.current;

    if (!recording || !isRecording) {
      return;
    }

    setIsRecording(false);
    recordingRef.current = null;
    setIsVoiceLoading(true);
    setError('');

    try {
      await recording.stopAndUnloadAsync();
      const audioUri = recording.getURI();

      if (!audioUri) {
        throw new Error('Missing recording URI');
      }

      const response = await uploadVoiceMessage(audioUri);
      const nextTranscribedText = response?.data?.transcribedText || '';
      const coachReply = response?.data?.coachReply;

      if (!coachReply) {
        throw new Error('Missing coach voice reply');
      }

      setTranscribedText(nextTranscribedText);
      setSuggestedQuestions(response?.data?.suggestedQuestions || DEFAULT_SUGGESTIONS);
      speakCoachReply(coachReply);
    } catch (voiceError) {
      console.error('Voice message failed', voiceError);
      setError(
        voiceError?.message ||
          'Không gửi được ghi âm. Kiểm tra mạng rồi thử lại.',
      );
    } finally {
      setIsVoiceLoading(false);
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
    }
  };

  const mascotThinkingStyle = {
    transform: [
      {
        scale: mascotPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [1, isVoiceLoading ? 1.05 : 1.03],
        }),
      },
      {
        translateY: mascotPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0, isVoiceLoading ? -6 : -3],
        }),
      },
    ],
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ android: 'height', ios: 'padding' })}
      style={styles.container}
    >
      <View style={styles.chatShell}>
        <View style={styles.coachHeader}>
          <View style={styles.coachTitleGroup}>
            <Text style={styles.coachName}>Mỏ Hỗn AI</Text>
            <Text style={styles.coachStatus}>Phân tích khoản chi và phản vấn mua hàng</Text>
          </View>
        </View>

        <View style={styles.modeToggle}>
          {[
            { key: 'text', label: 'Nhắn tin', icon: 'chatbubble-outline' },
            { key: 'voice', label: 'Trò chuyện giọng nói', icon: 'mic-outline' },
          ].map((item) => {
            const isActive = coachMode === item.key;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                key={item.key}
                onPress={() => {
                  setCoachMode(item.key);
                  setError('');
                }}
                style={({ pressed }) => [
                  styles.modeButton,
                  isActive && styles.modeButtonActive,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={isActive ? colors.primary : colors.mossText}
                />
              </Pressable>
            );
          })}
        </View>

        {coachMode === 'text' ? (
          <ScrollView
            ref={scrollViewRef}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}
            style={styles.messageScroll}
          >
            {messages.map((message) => {
              const isUser = message.role === 'user';

              return (
                <View
                  key={message.id}
                  style={[styles.messageRow, isUser ? styles.userMessageRow : styles.coachMessageRow]}
                >
                  {!isUser ? <CoachAvatar /> : null}
                  <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.coachBubble]}>
                    <Text selectable style={[styles.messageText, isUser && styles.userMessageText]}>
                      {message.text}
                    </Text>
                  </View>
                </View>
              );
            })}

            {isSending ? (
              <View style={[styles.messageRow, styles.coachMessageRow]}>
                <CoachAvatar />
                <View style={[styles.messageBubble, styles.coachBubble, styles.loadingBubble]}>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={styles.loadingText}>Đang nghĩ...</Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
        ) : (
          <View style={styles.voicePanel}>
            {transcribedText ? (
              <View style={styles.transcriptBox}>
                <Text selectable style={styles.transcriptText}>
                  {transcribedText}
                </Text>
              </View>
            ) : null}

            <Animated.Image
              source={mascotImage}
              resizeMode="contain"
              style={[styles.voiceMascot, mascotThinkingStyle]}
            />

            <View style={styles.voiceStatusGroup}>
              {isVoiceLoading ? (
                <>
                  <ActivityIndicator color={colors.primary} size="small" />
                  <Text style={styles.voiceStatusText}>Đang nghe lại và suy nghĩ...</Text>
                </>
              ) : (
                <Text style={styles.voiceStatusText}>
                  {isRecording ? 'Đang ghi âm...' : 'Nhấn giữ để nói với Mỏ Hỗn'}
                </Text>
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Nhấn giữ để ghi âm"
              disabled={isVoiceLoading}
              onPressIn={startRecording}
              onPressOut={stopRecording}
              style={({ pressed }) => [
                styles.recordButton,
                isRecording && styles.recordButtonActive,
                isVoiceLoading && styles.recordButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={isRecording ? 'mic' : 'mic-outline'}
                size={34}
                color={colors.surfaceRice}
              />
            </Pressable>
          </View>
        )}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text selectable style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

      {coachMode === 'text' ? (
      <View style={styles.composer}>
        <ScrollView
          contentContainerStyle={styles.suggestionList}
          horizontal
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
        >
          {suggestedQuestions.map((question) => (
            <Pressable
              disabled={isSending}
              key={question}
              onPress={() => sendMessage(question)}
              style={({ pressed }) => [
                styles.suggestionChip,
                (pressed || isSending) && styles.pressed,
              ]}
            >
              <Text style={styles.suggestionText}>{question}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            editable={!isSending}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage(inputText)}
            placeholder="Hỏi Mỏ Hỗn"
            placeholderTextColor={colors.onSurfaceVariant}
            returnKeyType="send"
            style={styles.input}
            value={inputText}
          />
          <Pressable
            disabled={!inputText.trim() || isSending}
            onPress={() => sendMessage(inputText)}
            style={({ pressed }) => [
              styles.sendButton,
              (!inputText.trim() || isSending) && styles.sendButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="send" size={18} color={colors.surfaceRice} />
          </Pressable>
        </View>
      </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.appCanvas,
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  chatShell: {
    flex: 1,
    minHeight: 0,
  },
  coachHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 8,
  },
  coachTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  coachName: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '900',
  },
  coachStatus: {
    color: colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  modeToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 6,
  },
  modeButton: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 38,
    paddingBottom: 6,
  },
  modeButtonActive: {
    borderBottomColor: colors.primary,
  },
  avatarImage: {
    borderRadius: 999,
    height: 38,
    width: 48,
  },
  messageScroll: {
    flex: 1,
  },
  messageList: {
    gap: 12,
    padding: 12,
    paddingBottom: 16,
  },
  voicePanel: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 18,
    padding: 20,
  },
  transcriptBox: {
    maxWidth: '96%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  transcriptText: {
    color: colors.mossText,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
  },
  voiceMascot: {
    height: '48%',
    minHeight: 280,
    width: '92%',
  },
  voiceStatusGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 24,
  },
  voiceStatusText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  recordButtonActive: {
    backgroundColor: colors.error,
  },
  recordButtonDisabled: {
    backgroundColor: colors.primaryContainer,
  },
  messageRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
  },
  coachMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    borderRadius: 18,
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  coachBubble: {
    backgroundColor: colors.surfaceMist,
    borderBottomLeftRadius: 6,
    borderColor: colors.softBorder,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  messageText: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  userMessageText: {
    color: colors.surfaceRice,
  },
  loadingBubble: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  loadingText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '800',
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: '#ffdad6',
    borderColor: '#ffb4ab',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  errorText: {
    color: colors.error,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  composer: {
    gap: 10,
  },
  suggestionList: {
    gap: 8,
    paddingRight: 20,
  },
  suggestionChip: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.primaryFixedDim,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
  },
  suggestionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  inputBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 6,
  },
  input: {
    ...safeTextInputStyles.singleLine,
    backgroundColor: colors.surfaceRice,
    borderWidth: 0,
    color: colors.onSurface,
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  sendButtonDisabled: {
    backgroundColor: colors.primaryContainer,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ translateY: 1 }],
  },
});
