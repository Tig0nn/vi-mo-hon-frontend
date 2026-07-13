import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { apiPost } from '../api/client';
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

function CoachAvatar() {
  return (
    <Image source={mascotImage} style={styles.avatarImage} resizeMode="cover" />
  );
}

export function CoachScreen({ userId }) {
  const scrollViewRef = useRef(null);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState(DEFAULT_SUGGESTIONS);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages, isSending]);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ android: 'height', ios: 'padding' })}
      style={styles.container}
    >
      <View style={styles.chatShell}>
        <View style={styles.coachHeader}>
          <CoachAvatar />
          <View style={styles.coachTitleGroup}>
            <Text style={styles.coachName}>Mỏ Hỗn AI</Text>
            <Text style={styles.coachStatus}>Phân tích khoản chi và phản vấn mua hàng</Text>
          </View>
          <Ionicons name="sparkles" size={20} color={colors.goldAccent} />
        </View>

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
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={colors.error} />
          <Text selectable style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    minHeight: 0,
  },
  chatShell: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  coachHeader: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderBottomColor: colors.softBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
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
