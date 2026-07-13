const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildLessonListPath,
  getLessonCompletionFailure,
  getLessonItems,
  getLessonStatusLabel,
} = require('../src/utils/lessons.cjs');

test('lesson list request is built only with both identifiers and safely encodes them', () => {
  assert.equal(buildLessonListPath('', 'bubble-tea-monster'), null);
  assert.equal(buildLessonListPath('vmh-user', ''), null);
  assert.equal(
    buildLessonListPath('vmh user', 'bubble-tea-monster'),
    '/lessons?userId=vmh%20user&bossId=bubble-tea-monster',
  );
});

test('lesson list response mapper safely reads only an item array', () => {
  const items = [{ id: 'lesson-1' }];
  assert.deepEqual(getLessonItems({ data: { items } }), items);
  assert.deepEqual(getLessonItems({ items }), items);
  assert.deepEqual(getLessonItems({ data: { items: null } }), []);
  assert.deepEqual(getLessonItems(null), []);
});

test('lesson completion errors use status and stable backend codes', () => {
  assert.deepEqual(getLessonCompletionFailure({
    status: 422,
    data: { errors: { code: 'LESSON_ANSWER_INCORRECT', explanation: 'Giải thích.' } },
  }), {
    kind: 'incorrect',
    message: 'Chưa đúng rồi, xem gợi ý và thử lại nhé.',
    explanation: 'Giải thích.',
  });

  assert.deepEqual(getLessonCompletionFailure({
    status: 409,
    data: { errors: { code: 'LESSON_ALREADY_COMPLETED' } },
  }), {
    kind: 'completed',
    message: 'Bạn đã hoàn thành bài học này.',
    explanation: '',
  });

  assert.deepEqual(getLessonCompletionFailure(new Error('Mất kết nối')), {
    kind: 'error',
    message: 'Mất kết nối',
    explanation: '',
  });
});

test('lesson status labels stay Vietnamese and action-oriented', () => {
  assert.equal(getLessonStatusLabel('completed'), 'Đã học');
  assert.equal(getLessonStatusLabel('available'), 'Học ngay');
  assert.equal(getLessonStatusLabel(), 'Học ngay');
});
