import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiGet } from '../api/client';
import { colors } from '../theme/colors';

const {
  buildLessonListPath,
  getLessonItems,
  getLessonStatusLabel,
} = require('../utils/lessons.cjs');

export function LessonList({
  userId,
  bossId,
  onSelectLesson,
  refreshKey = 0,
}) {
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const path = buildLessonListPath(userId, bossId);
    let isCurrent = true;

    if (!path) {
      setLessons([]);
      setError('');
      setIsLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    const loadLessons = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiGet(path);
        if (isCurrent) setLessons(getLessonItems(response));
      } catch (loadError) {
        if (isCurrent) {
          setLessons([]);
          setError(loadError.message || 'Chưa thể tải bài học.');
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadLessons();
    return () => {
      isCurrent = false;
    };
  }, [bossId, refreshKey, retryKey, userId]);

  if (isLoading) {
    return (
      <View style={styles.stateRow}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.stateText}>Đang tải bài học...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorState}>
        <Ionicons name="cloud-offline-outline" size={24} color={colors.error} />
        <View style={styles.stateCopy}>
          <Text style={styles.errorTitle}>Chưa tải được bài học</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setRetryKey((value) => value + 1)}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  if (lessons.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={28} color={colors.onSurfaceVariant} />
        <Text style={styles.emptyTitle}>Chưa có bài học</Text>
        <Text style={styles.stateText}>
          Bài học ngắn sẽ xuất hiện khi Boss sẵn sàng.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {lessons.map((lesson, index) => {
        const isCompleted = lesson?.status === 'completed';
        const cardCount = Array.isArray(lesson?.cards) ? lesson.cards.length : 0;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${lesson?.title || 'Bài học'}. ${getLessonStatusLabel(lesson?.status)}`}
            key={lesson?.id || `lesson-${index}`}
            onPress={() => onSelectLesson?.(lesson)}
            style={({ pressed }) => [
              styles.lessonRow,
              index > 0 && styles.lessonDivider,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.lessonCopy}>
              <Text selectable style={styles.lessonTitle}>
                {lesson?.title || `Bài học ${index + 1}`}
              </Text>
              <Text selectable style={styles.lessonSummary}>
                {lesson?.summary || 'Nội dung ngắn giúp bạn hiểu Boss.'}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{cardCount} thẻ</Text>
                <Text style={styles.metaText}>+{Number(lesson?.rewardXp || 0)} XP</Text>
                <Text style={[styles.statusText, isCompleted && styles.completedText]}>
                  {getLessonStatusLabel(lesson?.status)}
                </Text>
              </View>
            </View>
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'chevron-forward'}
              size={22}
              color={colors.primary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  lessonRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 88,
    paddingVertical: 14,
  },
  lessonDivider: {
    borderTopColor: colors.softBorder,
    borderTopWidth: 1,
  },
  lessonCopy: {
    flex: 1,
    minWidth: 0,
  },
  lessonTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  lessonSummary: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  metaText: {
    color: colors.mossText,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  statusText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  completedText: {
    color: colors.onSurfaceVariant,
  },
  stateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 72,
  },
  stateCopy: {
    flex: 1,
    minWidth: 0,
  },
  stateText: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
  },
  errorState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 72,
  },
  errorTitle: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '800',
  },
  retryButton: {
    alignItems: 'center',
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  retryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 18,
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ translateY: 1 }],
  },
});
