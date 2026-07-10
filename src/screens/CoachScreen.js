import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiPost } from '../api/client';
import { colors } from '../theme/colors';
import { safeTextInputStyles } from '../theme/inputStyles';

const INITIAL_MESSAGES = [
  {
    id: 'coach-welcome',
    role: 'coach',
    text: 'Xin chào, tôi có thể giúp gì cho bạn? Hỏi tôi về chi tiêu, tiết kiệm hoặc món bạn đang phân vân mua nha.',
  },
];

const DEFAULT_SUGGESTIONS = [
  'Món này có đáng mua không?',
  'Tuần này tôi chi nhiều nhất vào đâu?',
  'Làm sao tiết kiệm thêm 50.000đ?',
  'Tôi đang bị FOMO sale, cản tôi lại',
];

const createMessageId = (role) => `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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
      setError('Coach hơi lag rồi, thử lại nha.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>MH</Text>
        </View>
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>Bạn muốn biết gì về tài chính của mình?</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messageList}
        nestedScrollEnabled
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
              <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.coachBubble]}>
                <Text selectable style={[styles.messageText, isUser && styles.userMessageText]}>
                  {message.text}
                </Text>
              </View>
            </View>
          );
        })}

        {isSending ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Coach đang nghĩ...</Text>
          </View>
        ) : null}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.suggestionList}
        horizontal
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

      {error ? (
        <View style={styles.errorBox}>
          <Text selectable style={styles.errorText}>
            {error}
          </Text>
        </View>
      ) : null}

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
          <Text style={styles.sendButtonText}>Gửi</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  topArea: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.primaryFixedDim,
    borderRadius: 999,
    borderWidth: 2,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  avatarText: {
    color: colors.surfaceRice,
    fontSize: 15,
    fontWeight: '900',
  },
  speechBubble: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  speechText: {
    color: colors.onSurface,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  messageScroll: {
    maxHeight: 430,
  },
  messageList: {
    gap: 10,
    paddingVertical: 4,
  },
  messageRow: {
    flexDirection: 'row',
  },
  coachMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    borderRadius: 18,
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  coachBubble: {
    backgroundColor: colors.surfaceRice,
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
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  loadingText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '700',
  },
  suggestionList: {
    gap: 8,
    paddingRight: 20,
  },
  suggestionChip: {
    backgroundColor: colors.onSurface,
    borderRadius: 999,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  suggestionText: {
    color: colors.surfaceRice,
    fontSize: 13,
    fontWeight: '800',
  },
  errorBox: {
    backgroundColor: '#ffdad6',
    borderColor: '#ffb4ab',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
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
    backgroundColor: colors.softBorder,
  },
  sendButtonText: {
    color: colors.surfaceRice,
    fontSize: 13,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ translateY: 1 }],
  },
});
