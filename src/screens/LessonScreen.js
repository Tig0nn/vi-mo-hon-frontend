import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiPost } from '../api/client';
import { colors } from '../theme/colors';

const { getLessonCompletionFailure } = require('../utils/lessons.cjs');

function PrimaryButton({ label, onPress, disabled, isLoading = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.surfaceRice} />
      ) : (
        <Text style={styles.primaryButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function LessonScreen({
  lesson,
  userId,
  onBack,
  onRefreshDashboard,
}) {
  const listRef = useRef(null);
  const { width } = useWindowDimensions();
  const pageWidth = Math.min(width, 720);
  const cards = Array.isArray(lesson?.cards) ? lesson.cards : [];
  const answers = Array.isArray(lesson?.quiz?.answers) ? lesson.quiz.answers : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failure, setFailure] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(lesson?.status === 'completed');

  const slides = useMemo(() => [
    ...cards.map((card, index) => ({ kind: 'card', card, cardIndex: index })),
    completion
      ? { kind: 'success' }
      : alreadyCompleted
        ? { kind: 'completed' }
        : { kind: 'quiz' },
  ], [alreadyCompleted, cards, completion]);

  const goToSlide = (index) => {
    const safeIndex = Math.max(0, Math.min(slides.length - 1, index));
    listRef.current?.scrollToIndex({ index: safeIndex, animated: true });
    setCurrentIndex(safeIndex);
  };

  const submitAnswer = async () => {
    if (!selectedAnswerId || !lesson?.id || !userId || isSubmitting) return;
    setIsSubmitting(true);
    setFailure(null);

    try {
      const response = await apiPost(
        `/lessons/${encodeURIComponent(lesson.id)}/complete`,
        { userId, answerId: selectedAnswerId },
      );
      setCompletion(response?.data ?? response ?? {});
      await Promise.resolve(onRefreshDashboard?.());
    } catch (error) {
      const nextFailure = getLessonCompletionFailure(error);
      setFailure(nextFailure);
      if (nextFailure.kind === 'completed') setAlreadyCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCardSlide = (slide) => (
    <View style={styles.flashCard}>
      <View style={styles.cardHeading}>
        <Ionicons name="bulb-outline" size={28} color={colors.primary} />
        <Text style={styles.cardNumber}>Thẻ {slide.cardIndex + 1}</Text>
      </View>
      <View style={styles.cardCopy}>
        <Text selectable style={styles.cardTitle}>
          {slide.card?.title || `Thẻ ${slide.cardIndex + 1}`}
        </Text>
        <Text selectable style={styles.cardBody}>
          {slide.card?.body || 'Nội dung bài học đang được cập nhật.'}
        </Text>
      </View>
      <PrimaryButton
        label="Tiếp tục"
        onPress={() => goToSlide(slide.cardIndex + 1)}
      />
    </View>
  );

  const renderQuizSlide = () => (
    <View style={styles.quizPanel}>
      <View style={styles.quizHeading}>
        <Ionicons name="help-circle-outline" size={28} color={colors.primary} />
        <Text style={styles.quizLabel}>Câu hỏi cuối bài</Text>
      </View>
      <Text selectable style={styles.questionText}>
        {lesson?.quiz?.question || 'Chọn đáp án phù hợp nhất.'}
      </Text>

      <View style={styles.answerList}>
        {answers.map((answer, index) => {
          const isSelected = selectedAnswerId === answer?.id;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              key={answer?.id || `answer-${index}`}
              onPress={() => {
                setSelectedAnswerId(answer?.id || '');
                setFailure(null);
              }}
              style={({ pressed }) => [
                styles.answerButton,
                isSelected && styles.selectedAnswer,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.radio, isSelected && styles.selectedRadio]}>
                {isSelected ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={[styles.answerText, isSelected && styles.selectedAnswerText]}>
                {answer?.label || `Đáp án ${index + 1}`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {failure ? (
        <View style={styles.feedbackBox}>
          <Ionicons
            name={failure.kind === 'incorrect' ? 'information-circle-outline' : 'alert-circle-outline'}
            size={22}
            color={failure.kind === 'incorrect' ? colors.primary : colors.error}
          />
          <View style={styles.feedbackCopy}>
            <Text style={styles.feedbackTitle}>{failure.message}</Text>
            {failure.explanation ? (
              <Text selectable style={styles.feedbackText}>{failure.explanation}</Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <PrimaryButton
        label="Kiểm tra đáp án"
        disabled={!selectedAnswerId || isSubmitting}
        isLoading={isSubmitting}
        onPress={submitAnswer}
      />
    </View>
  );

  const renderFinishedSlide = (isSuccess) => {
    const progression = completion?.progression ?? {};
    return (
      <View style={styles.finishedPanel}>
        <Ionicons
          name={isSuccess ? 'checkmark-circle' : 'book-outline'}
          size={54}
          color={colors.primary}
        />
        <Text style={styles.finishedTitle}>
          {isSuccess ? 'Hoàn thành bài học' : 'Bạn đã hoàn thành bài học này'}
        </Text>
        <Text style={styles.finishedText}>
          {isSuccess
            ? 'Bạn đã hiểu thêm một chiêu của Boss.'
            : 'Bạn có thể đọc lại các thẻ bất cứ lúc nào.'}
        </Text>

        {isSuccess ? (
          <View style={styles.rewardRow}>
            <Text style={styles.rewardText}>
              +{Number(progression.xpGained ?? lesson?.rewardXp ?? 0)} XP
            </Text>
            <Text style={styles.rewardText}>
              +{Number(progression.knowledgeGained ?? lesson?.knowledgeReward ?? 0)} Kiến thức
            </Text>
          </View>
        ) : null}

        {isSuccess && completion?.explanation ? (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationLabel}>Vì sao?</Text>
            <Text selectable style={styles.feedbackText}>{completion.explanation}</Text>
          </View>
        ) : null}

        <PrimaryButton label="Quay lại Boss" onPress={onBack} />
      </View>
    );
  };

  const renderSlide = ({ item }) => (
    <ScrollView
      contentContainerStyle={styles.slideContent}
      showsVerticalScrollIndicator={false}
      style={{ width: pageWidth }}
    >
      {item.kind === 'card' ? renderCardSlide(item) : null}
      {item.kind === 'quiz' ? renderQuizSlide() : null}
      {item.kind === 'success' ? renderFinishedSlide(true) : null}
      {item.kind === 'completed' ? renderFinishedSlide(false) : null}
    </ScrollView>
  );

  const isFinalSlide = currentIndex >= cards.length;
  const progressText = isFinalSlide
    ? (completion || alreadyCompleted ? 'Hoàn tất' : 'Câu hỏi')
    : `${currentIndex + 1}/${Math.max(cards.length, 1)}`;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.shell, { width: pageWidth }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Quay lại Boss"
            accessibilityRole="button"
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <Text numberOfLines={2} style={styles.headerTitle}>
            {lesson?.title || 'Bài học 1 phút'}
          </Text>
          <Text style={styles.progressText}>{progressText}</Text>
        </View>

        <FlatList
          data={slides}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({ length: pageWidth, offset: pageWidth * index, index })}
          horizontal
          keyExtractor={(item, index) => `${item.kind}-${item.card?.id || index}`}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
            setCurrentIndex(nextIndex);
          }}
          pagingEnabled
          ref={listRef}
          renderItem={renderSlide}
          showsHorizontalScrollIndicator={false}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.appCanvas,
    flex: 1,
  },
  shell: {
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 16,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  progressText: {
    color: colors.primary,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    minWidth: 56,
    textAlign: 'right',
  },
  list: {
    flex: 1,
  },
  slideContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 28,
  },
  flashCard: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    gap: 24,
    justifyContent: 'space-between',
    minHeight: 440,
    padding: 24,
  },
  cardHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  cardNumber: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '800',
  },
  cardCopy: {
    flex: 1,
    gap: 14,
    justifyContent: 'center',
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 33,
  },
  cardBody: {
    color: colors.onSurface,
    fontSize: 18,
    lineHeight: 28,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: colors.surfaceRice,
    fontSize: 15,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.48,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }],
  },
  quizPanel: {
    flex: 1,
    gap: 18,
    minHeight: 520,
  },
  quizHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  quizLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  questionText: {
    color: colors.onSurface,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 30,
  },
  answerList: {
    gap: 10,
  },
  answerButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedAnswer: {
    backgroundColor: colors.surfaceMist,
    borderColor: colors.primary,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.onSurfaceVariant,
    borderRadius: 999,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  selectedRadio: {
    borderColor: colors.primary,
  },
  radioDot: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  answerText: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 21,
  },
  selectedAnswerText: {
    color: colors.primary,
    fontWeight: '900',
  },
  feedbackBox: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceMist,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  feedbackCopy: {
    flex: 1,
    gap: 4,
  },
  feedbackTitle: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  feedbackText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 21,
  },
  finishedPanel: {
    alignItems: 'center',
    flex: 1,
    gap: 14,
    justifyContent: 'center',
    minHeight: 480,
  },
  finishedTitle: {
    color: colors.onSurface,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 31,
    textAlign: 'center',
  },
  finishedText: {
    color: colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  rewardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    marginVertical: 6,
  },
  rewardText: {
    color: colors.primary,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  explanationBox: {
    alignSelf: 'stretch',
    backgroundColor: colors.surfaceMist,
    borderRadius: 16,
    gap: 5,
    padding: 16,
  },
  explanationLabel: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '900',
  },
});
