import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { apiPatch } from '../api/client';
import { Card } from '../components/Card';
import { DataRow } from '../components/DataRow';
import { IconBadge } from '../components/IconBadge';
import { colors } from '../theme/colors';
import { safeTextInputStyles } from '../theme/inputStyles';
import { formatTargetDate, formatVnd, GOAL_LABELS } from '../utils/profile';
import {
  cancelDailyExpenseReminder,
  formatReminderTime,
  getScheduledReminders,
  requestNotificationPermission,
  scheduleDailyExpenseReminder,
  scheduleTestExpenseReminder,
} from '../utils/notifications';

const DEFAULT_REMINDER_TIME = { hour: 20, minute: 30 };

function profileValue(profile, primaryKey, fallbackKey = null) {
  return profile?.[primaryKey] ?? (fallbackKey ? profile?.[fallbackKey] : undefined);
}

function createFormState(profile) {
  const monthlyBudget = profileValue(profile, 'monthlyBudget', 'budget');

  return {
    displayName: profileValue(profile, 'displayName', 'name') || '',
    monthlyBudget:
      monthlyBudget === null || monthlyBudget === undefined ? '' : String(monthlyBudget),
  };
}

function parseMonthlyBudget(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const normalizedValue = trimmedValue.replace(/[.,\s]/g, '');

  if (!/^\d+$/.test(normalizedValue)) {
    return null;
  }

  const monthlyBudget = Number(normalizedValue);
  return Number.isFinite(monthlyBudget) && monthlyBudget > 0 ? monthlyBudget : null;
}

function parseReminderTimeInput(value) {
  const match = value.trim().match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

export function ProfileScreen({ dashboard, profile: savedProfile, userId, onRefreshDashboard }) {
  const dashboardProfile = (dashboard?.data ?? dashboard)?.profile;
  const profile = useMemo(
    () => ({ ...(dashboardProfile || {}), ...(savedProfile || {}) }),
    [dashboardProfile, savedProfile]
  );
  const currentFormState = useMemo(() => createFormState(profile), [profile]);
  const [form, setForm] = useState(currentFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [notificationError, setNotificationError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isReminderLoading, setIsReminderLoading] = useState(false);
  const [isReminderTimeEditing, setIsReminderTimeEditing] = useState(false);
  const [reminderTimeText, setReminderTimeText] = useState(formatReminderTime(DEFAULT_REMINDER_TIME));
  const [reminderTimeError, setReminderTimeError] = useState('');
  const [dailyReminder, setDailyReminder] = useState({
    enabled: false,
    time: DEFAULT_REMINDER_TIME,
  });

  const refreshReminderState = useCallback(async () => {
    try {
      const reminders = await getScheduledReminders();
      const activeReminder = reminders[0];

      setDailyReminder({
        enabled: Boolean(activeReminder),
        time: activeReminder?.time || DEFAULT_REMINDER_TIME,
      });
      setReminderTimeText(formatReminderTime(activeReminder?.time || DEFAULT_REMINDER_TIME));
      setNotificationError('');
    } catch (error) {
      setNotificationError('Chưa đọc được lịch nhắc. Thử lại sau nhé.');
    }
  }, []);

  useEffect(() => {
    if (!isEditing) {
      setForm(currentFormState);
    }
  }, [currentFormState, isEditing]);

  useEffect(() => {
    if (!isReminderTimeEditing) {
      setReminderTimeText(formatReminderTime(dailyReminder.time));
    }
  }, [dailyReminder.time, isReminderTimeEditing]);

  useEffect(() => {
    refreshReminderState();
  }, [refreshReminderState]);

  const updateFormField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleStartEditing = () => {
    setForm(currentFormState);
    setFormError('');
    setSuccessMessage('');
    setNotificationError('');
    setNotificationMessage('');
    setIsReminderTimeEditing(false);
    setReminderTimeError('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(currentFormState);
    setFormError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    const displayName = form.displayName.trim();
    const monthlyBudget = parseMonthlyBudget(form.monthlyBudget);
    if (!displayName) {
      setFormError('Tên hiển thị không được để trống.');
      return;
    }

    if (monthlyBudget === null) {
      setFormError('Ngân sách tháng phải là một số dương.');
      return;
    }

    const payload = { displayName };

    if (monthlyBudget !== undefined) {
      payload.monthlyBudget = monthlyBudget;
    }

    setIsSaving(true);
    setFormError('');
    setSuccessMessage('');

    try {
      await apiPatch(`/profile/${userId}`, payload);
      setSuccessMessage('Đã lưu hồ sơ thành công.');

      await onRefreshDashboard?.();
      setIsEditing(false);
    } catch (saveError) {
      setFormError(saveError.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableReminder = async () => {
    setIsReminderLoading(true);
    setNotificationError('');
    setNotificationMessage('');

    try {
      const permission = await requestNotificationPermission();

      if (!permission.granted) {
        setNotificationError('Bạn cần cho phép thông báo để bật nhắc nhở hằng ngày.');
        return;
      }

      await scheduleDailyExpenseReminder(dailyReminder.time || DEFAULT_REMINDER_TIME);
      await refreshReminderState();
      setNotificationMessage(
        `Đã bật nhắc nhở hằng ngày lúc ${formatReminderTime(
          dailyReminder.time || DEFAULT_REMINDER_TIME
        )}.`
      );
    } catch (error) {
      setNotificationError(error.message || 'Chưa bật được nhắc nhở. Thử lại sau nhé.');
    } finally {
      setIsReminderLoading(false);
    }
  };

  const handleDisableReminder = async () => {
    setIsReminderLoading(true);
    setNotificationError('');
    setNotificationMessage('');

    try {
      await cancelDailyExpenseReminder();
      await refreshReminderState();
      setNotificationMessage('Đã tắt nhắc nhở hằng ngày.');
    } catch (error) {
      setNotificationError(error.message || 'Chưa tắt được nhắc nhở. Thử lại sau nhé.');
    } finally {
      setIsReminderLoading(false);
    }
  };

  const handleStartReminderTimeEditing = () => {
    setReminderTimeText(formatReminderTime(dailyReminder.time));
    setReminderTimeError('');
    setNotificationError('');
    setNotificationMessage('');
    setIsReminderTimeEditing(true);
  };

  const handleCancelReminderTimeEditing = () => {
    setReminderTimeText(formatReminderTime(dailyReminder.time));
    setReminderTimeError('');
    setIsReminderTimeEditing(false);
  };

  const handleSaveReminderTime = async () => {
    const nextReminderTime = parseReminderTimeInput(reminderTimeText);

    if (!nextReminderTime) {
      setReminderTimeError('Giờ nhắc không hợp lệ. Hãy nhập dạng HH:mm, ví dụ 20:30.');
      return;
    }

    setIsReminderLoading(true);
    setNotificationError('');
    setNotificationMessage('');
    setReminderTimeError('');

    try {
      setDailyReminder((currentReminder) => ({
        ...currentReminder,
        time: nextReminderTime,
      }));

      if (dailyReminder.enabled) {
        await scheduleDailyExpenseReminder(nextReminderTime);
        await refreshReminderState();
      }

      setReminderTimeText(formatReminderTime(nextReminderTime));
      setIsReminderTimeEditing(false);
      setNotificationMessage('Đã cập nhật giờ nhắc.');
    } catch (error) {
      setNotificationError(error.message || 'Chưa đổi được giờ nhắc. Thử lại sau nhé.');
    } finally {
      setIsReminderLoading(false);
    }
  };

  const handleSendTestReminder = async () => {
    setIsReminderLoading(true);
    setNotificationError('');
    setNotificationMessage('');

    try {
      const permission = await requestNotificationPermission();

      if (!permission.granted) {
        setNotificationError('Bạn cần cho phép thông báo để gửi thử nhắc nhở.');
        return;
      }

      await scheduleTestExpenseReminder();
      setNotificationMessage('Đã hẹn thông báo thử sau 5 giây.');
    } catch (error) {
      setNotificationError(error.message || 'Chưa gửi thử được thông báo. Thử lại sau nhé.');
    } finally {
      setIsReminderLoading(false);
    }
  };

  if (isEditing) {
    return (
      <View style={styles.editContainer}>
        <Card title="Chỉnh sửa hồ sơ" icon={<IconBadge label="✎" variant="warm" />}>
          {formError ? (
            <View style={styles.errorBox}>
              <Text selectable style={styles.errorText}>
                {formError}
              </Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Tên hiển thị</Text>
            <TextInput
              editable={!isSaving}
              onChangeText={(value) => updateFormField('displayName', value)}
              placeholder="Ví dụ: Minh Anh"
              placeholderTextColor={colors.onSurfaceVariant}
              style={styles.input}
              value={form.displayName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Ngân sách tháng</Text>
            <TextInput
              editable={!isSaving}
              keyboardType="numeric"
              onChangeText={(value) => updateFormField('monthlyBudget', value)}
              placeholder="Ví dụ: 3500000"
              placeholderTextColor={colors.onSurfaceVariant}
              style={styles.input}
              value={form.monthlyBudget}
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable
              disabled={isSaving}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.primaryButton,
                styles.actionButton,
                (pressed || isSaving) && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </Text>
            </Pressable>

            <Pressable
              disabled={isSaving}
              onPress={handleCancel}
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.actionButton,
                (pressed || isSaving) && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Hủy</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card title="Kế hoạch tiền bạc" icon={<IconBadge label="₫" />}>
        <DataRow
          label="Mục tiêu"
          value={GOAL_LABELS[profile.mainGoal] || 'Chưa thiết lập mục tiêu'}
        />
        <DataRow label="Số tiền muốn tiết kiệm" value={formatVnd(profile.targetAmount)} />
        <DataRow label="Thời hạn hoàn thành" value={formatTargetDate(profile.targetDate)} />
        <DataRow label="Giới hạn chi tiêu tháng" value={formatVnd(profile.monthlyBudget ?? profile.budget)} />
        <DataRow label="Đã chi tháng này" value={formatVnd(profile.monthlySpent)} />
      </Card>

      <Card title="Nhắc nhở hằng ngày" icon={<IconBadge label="NR" variant="warm" />}>
        <DataRow label="Trạng thái" value={dailyReminder.enabled ? 'Đang bật' : 'Đang tắt'} />
        <DataRow label="Giờ nhắc" value={formatReminderTime(dailyReminder.time)} />

        {isReminderTimeEditing ? (
          <View style={styles.timeEditor}>
            <View style={styles.field}>
              <Text style={styles.label}>Nhập giờ nhắc</Text>
              <TextInput
                editable={!isReminderLoading}
                keyboardType="numbers-and-punctuation"
                onChangeText={(value) => {
                  setReminderTimeText(value);
                  setReminderTimeError('');
                }}
                placeholder="VD: 20:30"
                placeholderTextColor={colors.onSurfaceVariant}
                style={styles.input}
                value={reminderTimeText}
              />
            </View>

            {reminderTimeError ? (
              <Text selectable style={styles.inlineErrorText}>
                {reminderTimeError}
              </Text>
            ) : null}

            <View style={styles.actionRow}>
              <Pressable
                disabled={isReminderLoading}
                onPress={handleSaveReminderTime}
                style={({ pressed }) => [
                  styles.primaryButton,
                  styles.actionButton,
                  (pressed || isReminderLoading) && styles.buttonPressed,
                  isReminderLoading && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.primaryButtonText}>Lưu giờ nhắc</Text>
              </Pressable>

              <Pressable
                disabled={isReminderLoading}
                onPress={handleCancelReminderTimeEditing}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  styles.actionButton,
                  (pressed || isReminderLoading) && styles.secondaryButtonPressed,
                  isReminderLoading && styles.buttonDisabled,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Hủy</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            disabled={isReminderLoading}
            onPress={handleStartReminderTimeEditing}
            style={({ pressed }) => [
              styles.secondaryButton,
              (pressed || isReminderLoading) && styles.secondaryButtonPressed,
              isReminderLoading && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Đổi giờ nhắc</Text>
          </Pressable>
        )}

        {notificationError ? (
          <View style={styles.errorBox}>
            <Text selectable style={styles.errorText}>
              {notificationError}
            </Text>
          </View>
        ) : null}

        {notificationMessage ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{notificationMessage}</Text>
          </View>
        ) : null}

        <View style={styles.actionRow}>
          <Pressable
            disabled={isReminderLoading}
            onPress={handleEnableReminder}
            style={({ pressed }) => [
              styles.primaryButton,
              styles.actionButton,
              (pressed || isReminderLoading) && styles.buttonPressed,
              isReminderLoading && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>Bật nhắc nhở</Text>
          </Pressable>

          <Pressable
            disabled={isReminderLoading}
            onPress={handleDisableReminder}
            style={({ pressed }) => [
              styles.secondaryButton,
              styles.actionButton,
              (pressed || isReminderLoading) && styles.secondaryButtonPressed,
              isReminderLoading && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Tắt nhắc nhở</Text>
          </Pressable>
        </View>

        <Pressable
          disabled={isReminderLoading}
          onPress={handleSendTestReminder}
          style={({ pressed }) => [
            styles.secondaryButton,
            (pressed || isReminderLoading) && styles.secondaryButtonPressed,
            isReminderLoading && styles.buttonDisabled,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Gửi thử sau 5 giây</Text>
        </Pressable>
      </Card>

      <Pressable
        onPress={handleStartEditing}
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.primaryButtonText}>Chỉnh sửa hồ sơ</Text>
      </Pressable>

      {successMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },
  editContainer: {
    gap: 16,
    paddingBottom: 48,
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.mossText,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    ...safeTextInputStyles.singleLine,
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.onSurface,
  },
  timeEditor: {
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexGrow: 1,
    minWidth: 132,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: colors.surfaceRice,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryButtonPressed: {
    backgroundColor: colors.surfaceMist,
    opacity: 0.75,
  },
  secondaryButtonText: {
    color: colors.mossText,
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ translateY: 1 }],
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  errorBox: {
    backgroundColor: '#ffdad6',
    borderColor: '#ffb4ab',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  inlineErrorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  successBox: {
    backgroundColor: '#DFF3D2',
    borderColor: colors.primaryFixedDim,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  successText: {
    color: colors.onPrimaryContainer,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
