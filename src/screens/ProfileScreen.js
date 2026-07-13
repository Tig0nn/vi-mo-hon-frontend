import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiPatch } from '../api/client';
import { Card } from '../components/Card';
import { DataRow } from '../components/DataRow';
import { colors } from '../theme/colors';
import { safeTextInputStyles } from '../theme/inputStyles';
import { formatTargetDate, formatVnd, GOAL_LABELS } from '../utils/profile';

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


function SectionHeader({ icon, title, hint, gold = false }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
      </View>
      <Ionicons name={icon} size={22} color={gold ? colors.goldAccent : colors.primary} />
    </View>
  );
}

function MiniBadge({ icon, label, earned }) {
  return (
    <View style={[styles.miniBadge, !earned && styles.miniBadgeLocked]}>
      <View style={[styles.miniBadgeIcon, earned ? styles.miniBadgeIconEarned : styles.miniBadgeIconLocked]}>
        <Ionicons
          name={earned ? icon : 'lock-closed'}
          size={18}
          color={earned ? colors.surfaceRice : colors.onSurfaceVariant}
        />
      </View>
      <Text style={[styles.miniBadgeText, !earned && styles.miniBadgeTextLocked]}>{label}</Text>
    </View>
  );
}

export function ProfileScreen({ dashboard, profile: savedProfile, userId, onRefreshDashboard }) {
  const dashboardData = dashboard?.data ?? dashboard ?? {};
  const dashboardProfile = dashboardData?.profile;
  const recentExpenses = Array.isArray(dashboardData.recentExpenses) ? dashboardData.recentExpenses : [];
  const boss = dashboardData.boss ?? {};
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

  const completedChallenges = Number(boss.completedChallenges || 0);
  const totalChallenges = Number(boss.totalChallenges || 0);
  const chapterPercent = totalChallenges > 0
    ? Math.max(0, Math.min(100, (completedChallenges / totalChallenges) * 100))
    : 0;


  useEffect(() => {
    if (!isEditing) {
      setForm(currentFormState);
    }
  }, [currentFormState, isEditing]);


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

  if (isEditing) {
    return (
      <View style={styles.editContainer}>
        <Card>
          <SectionHeader icon="create" title="Chỉnh sửa hồ sơ" hint="Tên hiển thị và ngân sách tháng" />

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
      <Card>
        <SectionHeader icon="wallet" title="Kế hoạch tiền bạc" hint="Thông tin profile từ backend" />
        <DataRow
          label="Mục tiêu"
          value={GOAL_LABELS[profile.mainGoal] || 'Chưa thiết lập mục tiêu'}
        />
        <DataRow label="Số tiền muốn tiết kiệm" value={formatVnd(profile.targetAmount)} />
        <DataRow label="Thời hạn hoàn thành" value={formatTargetDate(profile.targetDate)} />
        <DataRow label="Giới hạn chi tiêu tháng" value={formatVnd(profile.monthlyBudget ?? profile.budget)} />
        <DataRow label="Đã chi tháng này" value={formatVnd(profile.monthlySpent)} />
      </Card>

      <Card>
        <SectionHeader icon="ribbon" title="Thành tựu & tiến độ" hint="Dựa trên dashboard hiện có" gold />

        <View style={styles.chapterProgress}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Chapter hiện tại</Text>
            <Text style={styles.progressValue}>{completedChallenges}/{totalChallenges || 0}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${chapterPercent}%` }]} />
          </View>
        </View>

        <View style={styles.miniBadgeGrid}>
          <MiniBadge icon="receipt" label="Ghi chép" earned={recentExpenses.length > 0} />
          <MiniBadge icon="shield-checkmark" label="Kỷ luật" earned={Number(profile.discipline || 0) >= 10} />
          <MiniBadge icon="trophy" label="Challenge" earned={completedChallenges > 0} />
          <MiniBadge icon="star" label="Lên cấp" earned={Number(profile.level || 1) > 1} />
        </View>
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
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  sectionCopy: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionHint: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.mossText,
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    ...safeTextInputStyles.singleLine,
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    color: colors.onSurface,
  },
  timeEditor: {
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 16,
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
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: colors.surfaceRice,
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 999,
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
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
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
    borderRadius: 14,
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
    fontWeight: '700',
    lineHeight: 18,
  },
  successBox: {
    backgroundColor: colors.surfaceMist,
    borderColor: colors.primaryFixedDim,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  successText: {
    color: colors.onPrimaryContainer,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  chapterProgress: {
    backgroundColor: colors.surfaceMist,
    borderRadius: 16,
    gap: 8,
    padding: 12,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '800',
  },
  progressValue: {
    color: colors.onSurfaceVariant,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  progressTrack: {
    backgroundColor: colors.primaryFixedDim,
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: '100%',
  },
  miniBadgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  miniBadge: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    flexGrow: 1,
    gap: 8,
    minWidth: 134,
    padding: 10,
  },
  miniBadgeLocked: {
    opacity: 0.68,
  },
  miniBadgeIcon: {
    alignItems: 'center',
    borderRadius: 999,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  miniBadgeIconEarned: {
    backgroundColor: colors.goldAccent,
  },
  miniBadgeIconLocked: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderWidth: 1,
  },
  miniBadgeText: {
    color: colors.onSurface,
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  miniBadgeTextLocked: {
    color: colors.onSurfaceVariant,
  },
});
