import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const DAILY_REMINDER_TYPE = 'daily-expense-reminder';
const TEST_REMINDER_TYPE = 'test-expense-reminder';
const REMINDER_CHANNEL_ID = 'daily-expense-reminders';

const DAILY_REMINDER_CONTENT = {
  title: 'Ví Mỏ Hỗn nhắc nhẹ',
  body: 'Ghi nhanh khoản chi hôm nay trước khi não bạn xoá lịch sử nha.',
  data: {
    reminderType: DAILY_REMINDER_TYPE,
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Nhắc nhở hằng ngày',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#9cd763',
  });
}

function isDailyReminder(request) {
  return request?.content?.data?.reminderType === DAILY_REMINDER_TYPE;
}

function getReminderTimeFromRequest(request) {
  const data = request?.content?.data ?? {};
  const trigger = request?.trigger ?? {};
  const hour = Number(data.hour ?? trigger.hour);
  const minute = Number(data.minute ?? trigger.minute);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  return { hour, minute };
}

export function formatReminderTime({ hour, minute } = {}) {
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return '20:30';
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export async function requestNotificationPermission() {
  await ensureAndroidNotificationChannel();

  const currentPermissions = await Notifications.getPermissionsAsync();
  const finalPermissions = currentPermissions.granted
    ? currentPermissions
    : await Notifications.requestPermissionsAsync();

  return {
    granted: finalPermissions.granted,
    status: finalPermissions.status,
  };
}

export async function scheduleDailyExpenseReminder({ hour = 20, minute = 30 } = {}) {
  await ensureAndroidNotificationChannel();
  await cancelDailyExpenseReminder();

  return Notifications.scheduleNotificationAsync({
    content: {
      ...DAILY_REMINDER_CONTENT,
      data: {
        ...DAILY_REMINDER_CONTENT.data,
        hour,
        minute,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: REMINDER_CHANNEL_ID,
      hour,
      minute,
    },
  });
}

export async function scheduleTestExpenseReminder() {
  await ensureAndroidNotificationChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test nhắc nhở',
      body: 'Nếu bạn thấy thông báo này, notification đã chạy.',
      data: {
        reminderType: TEST_REMINDER_TYPE,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      channelId: REMINDER_CHANNEL_ID,
      seconds: 5,
    },
  });
}

export async function cancelDailyExpenseReminder() {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  const dailyReminders = scheduledNotifications.filter(isDailyReminder);

  await Promise.all(
    dailyReminders.map((reminder) =>
      Notifications.cancelScheduledNotificationAsync(reminder.identifier)
    )
  );
}

export async function getScheduledReminders() {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

  return scheduledNotifications.filter(isDailyReminder).map((request) => ({
    id: request.identifier,
    time: getReminderTimeFromRequest(request),
  }));
}
