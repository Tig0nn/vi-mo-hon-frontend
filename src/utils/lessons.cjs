function buildLessonListPath(userId, bossId) {
  const safeUserId = typeof userId === 'string' ? userId.trim() : '';
  const safeBossId = typeof bossId === 'string' ? bossId.trim() : '';
  if (!safeUserId || !safeBossId) return null;
  return `/lessons?userId=${encodeURIComponent(safeUserId)}&bossId=${encodeURIComponent(safeBossId)}`;
}

function getLessonItems(response) {
  const items = response?.data?.items ?? response?.items;
  return Array.isArray(items) ? items : [];
}

function getLessonCompletionFailure(error) {
  const code = error?.data?.errors?.code;
  const explanation = error?.data?.errors?.explanation || '';

  if (error?.status === 422 && code === 'LESSON_ANSWER_INCORRECT') {
    return {
      kind: 'incorrect',
      message: 'Chưa đúng rồi, xem gợi ý và thử lại nhé.',
      explanation,
    };
  }

  if (error?.status === 409 && code === 'LESSON_ALREADY_COMPLETED') {
    return {
      kind: 'completed',
      message: 'Bạn đã hoàn thành bài học này.',
      explanation: '',
    };
  }

  return {
    kind: 'error',
    message: error?.message || 'Chưa thể kiểm tra đáp án. Vui lòng thử lại.',
    explanation: '',
  };
}

function getLessonStatusLabel(status) {
  return status === 'completed' ? 'Đã học' : 'Học ngay';
}

module.exports = {
  buildLessonListPath,
  getLessonCompletionFailure,
  getLessonItems,
  getLessonStatusLabel,
};
