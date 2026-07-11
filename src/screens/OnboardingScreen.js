import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { apiPost } from '../api/client';
import { TargetDateField } from '../components/TargetDateField';
import { colors } from '../theme/colors';
import { formatVnd, GOAL_LABELS } from '../utils/profile';

const { getTargetDateError } = require('../utils/date.cjs');

const GOAL_OPTIONS = Object.entries(GOAL_LABELS)
  .filter(([value]) => value !== 'other')
  .map(([value, label]) => ({ value, label }));
const TRIGGER_OPTIONS = [
  ['flash_sale', 'Khi thấy giảm giá'],
  ['emotional_spending', 'Khi buồn hoặc căng thẳng'],
  ['friends', 'Khi đi chơi với bạn bè'],
  ['social_media', 'Khi lướt mạng xã hội'],
  ['payday', 'Khi vừa nhận lương'],
  ['social_comparison', 'Khi thấy người khác mua'],
  ['food_craving', 'Khi thèm ăn hoặc đồ uống'],
  ['fomo', 'Khi sợ bỏ lỡ'],
  ['self_reward', 'Khi muốn tự thưởng'],
  ['other', 'Trường hợp khác'],
].map(([value, label]) => ({ value, label }));

function digitsOnly(value) {
  return value.replace(/\D/g, '');
}

function createForm(profile) {
  return {
    displayName: profile?.displayName || '',
    mainGoal: profile?.mainGoal || '',
    targetAmount: profile?.targetAmount ? String(profile.targetAmount) : '',
    targetDate: profile?.targetDate || '',
    monthlyBudget: profile?.monthlyBudget ? String(profile.monthlyBudget) : '',
    triggers: Array.isArray(profile?.triggers) ? profile.triggers : [],
  };
}

export function OnboardingScreen({ userId, initialProfile, onFinish }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => createForm(initialProfile));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setForm(createForm(initialProfile)), [initialProfile]);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setMoneyField = (field, value) => setField(field, digitsOnly(value));
  const amountIsValid = (value) => /^\d+$/.test(value) && Number(value) > 0;

  const validateStep = () => {
    if (step === 1) {
      if (!form.displayName.trim()) return 'Vui lòng nhập tên của bạn.';
      if (form.displayName.trim().length > 80) return 'Tên của bạn tối đa 80 ký tự.';
    }
    if (step === 2) {
      if (!GOAL_OPTIONS.some((option) => option.value === form.mainGoal)) {
        return 'Vui lòng chọn mục tiêu của bạn.';
      }
      if (!amountIsValid(form.targetAmount)) return 'Số tiền bạn muốn tiết kiệm phải là số nguyên lớn hơn 0.';
      const targetDateError = getTargetDateError(form.targetDate);
      if (targetDateError) return targetDateError;
      if (!amountIsValid(form.monthlyBudget)) return 'Giới hạn chi tiêu mỗi tháng phải là số nguyên lớn hơn 0.';
    }
    if (step === 3 && !form.triggers.length) return 'Hãy chọn ít nhất một lúc bạn dễ tiêu tiền.';
    return '';
  };

  const handleNext = () => {
    const message = validateStep();
    setError(message);
    if (!message) setStep((current) => current + 1);
  };

  const handleSubmit = async () => {
    const message = validateStep();
    setError(message);
    if (message || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const profile = await apiPost('/profile', {
        userId,
        displayName: form.displayName.trim(),
        monthlyBudget: Number(form.monthlyBudget),
        mainGoal: form.mainGoal,
        targetAmount: Number(form.targetAmount),
        targetDate: form.targetDate,
        triggers: form.triggers,
        preferredTone: 'funny',
      });
      onFinish(profile?.data?.profile ?? profile?.profile ?? profile?.data ?? profile);
    } catch (submitError) {
      setError(submitError.message || 'Chưa thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTrigger = (value) => setField(
    'triggers',
    form.triggers.includes(value) ? form.triggers.filter((item) => item !== value) : [...form.triggers, value]
  );
  const moneyPreview = (value) => (value ? formatVnd(value) : null);

  return <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.step}>Bước {step}/3</Text>
      {step === 1 ? <View style={styles.section}>
        <Text style={styles.title}>Bắt đầu nhé</Text>
        <Text style={styles.label}>Tên của bạn</Text>
        <TextInput style={styles.input} value={form.displayName} onChangeText={(value) => setField('displayName', value)} maxLength={80} placeholder="Ví dụ: Minh Anh" placeholderTextColor={colors.onSurfaceVariant} />
      </View> : null}
      {step === 2 ? <View style={styles.section}>
        <Text style={styles.title}>Mục tiêu tài chính</Text>
        <Text style={styles.label}>Mục tiêu của bạn</Text>
        <View style={styles.options}>{GOAL_OPTIONS.map((option) => <Pressable key={option.value} onPress={() => setField('mainGoal', option.value)} style={[styles.option, form.mainGoal === option.value && styles.optionSelected]}><Text style={[styles.optionText, form.mainGoal === option.value && styles.optionTextSelected]}>{option.label}</Text></Pressable>)}</View>
        <Text style={styles.label}>Số tiền bạn muốn tiết kiệm</Text>
        <TextInput style={styles.input} value={form.targetAmount} onChangeText={(value) => setMoneyField('targetAmount', value)} keyboardType="numeric" placeholder="Ví dụ: 20000000" placeholderTextColor={colors.onSurfaceVariant} />
        {moneyPreview(form.targetAmount) ? <Text style={styles.preview}>{moneyPreview(form.targetAmount)}</Text> : null}
        <TargetDateField
          disabled={isSubmitting}
          onChange={(value) => {
            setField('targetDate', value);
            setError('');
          }}
          value={form.targetDate}
        />
        <Text style={styles.label}>Giới hạn chi tiêu mỗi tháng</Text>
        <TextInput style={styles.input} value={form.monthlyBudget} onChangeText={(value) => setMoneyField('monthlyBudget', value)} keyboardType="numeric" placeholder="Ví dụ: 10000000" placeholderTextColor={colors.onSurfaceVariant} />
        {moneyPreview(form.monthlyBudget) ? <Text style={styles.preview}>{moneyPreview(form.monthlyBudget)}</Text> : null}
      </View> : null}
      {step === 3 ? <View style={styles.section}>
        <Text style={styles.title}>Thói quen chi tiêu</Text>
        <Text style={styles.label}>Những lúc bạn dễ tiêu tiền</Text>
        <View style={styles.options}>{TRIGGER_OPTIONS.map((option) => <Pressable key={option.value} onPress={() => toggleTrigger(option.value)} style={[styles.option, form.triggers.includes(option.value) && styles.optionSelected]}><Text style={[styles.optionText, form.triggers.includes(option.value) && styles.optionTextSelected]}>{option.label}</Text></Pressable>)}</View>
      </View> : null}
      {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
      <View style={styles.actions}>{step > 1 ? <Pressable onPress={() => { setError(''); setStep((current) => current - 1); }} disabled={isSubmitting} style={styles.secondary}><Text style={styles.secondaryText}>Quay lại</Text></Pressable> : <View />}
        <Pressable onPress={step === 3 ? handleSubmit : handleNext} disabled={isSubmitting} style={[styles.primary, isSubmitting && styles.disabled]}>{isSubmitting ? <ActivityIndicator color={colors.surfaceRice} /> : <Text style={styles.primaryText}>{step === 3 ? 'Hoàn thành' : 'Tiếp tục'}</Text>}</Pressable></View>
    </ScrollView>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.appCanvas }, content: { flexGrow: 1, gap: 20, padding: 24, paddingTop: 64, paddingBottom: 40 }, step: { color: colors.primary, fontSize: 14, fontWeight: '800' }, section: { gap: 12 }, title: { color: colors.primary, fontSize: 28, fontWeight: '800', marginBottom: 8 }, label: { color: colors.mossText, fontSize: 15, fontWeight: '700', marginTop: 4 }, input: { backgroundColor: colors.surfaceRice, borderColor: colors.softBorder, borderRadius: 12, borderWidth: 1, color: colors.onSurface, fontSize: 16, minHeight: 52, paddingHorizontal: 14 }, preview: { color: colors.onSurfaceVariant, fontSize: 14, fontWeight: '600', marginTop: -6 }, options: { gap: 8 }, option: { backgroundColor: colors.surfaceRice, borderColor: colors.softBorder, borderRadius: 12, borderWidth: 1, minHeight: 48, justifyContent: 'center', paddingHorizontal: 14 }, optionSelected: { backgroundColor: colors.primaryContainer, borderColor: colors.primary }, optionText: { color: colors.onSurface, fontSize: 15, fontWeight: '600' }, optionTextSelected: { color: colors.onPrimaryContainer, fontWeight: '800' }, errorBox: { backgroundColor: '#ffdad6', borderColor: '#ffb4ab', borderRadius: 12, borderWidth: 1, padding: 14 }, errorText: { color: colors.error, fontSize: 14, lineHeight: 20 }, actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12 }, primary: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', minHeight: 50, minWidth: 132, paddingHorizontal: 16 }, primaryText: { color: colors.surfaceRice, fontSize: 16, fontWeight: '800' }, secondary: { alignItems: 'center', borderColor: colors.softBorder, borderRadius: 12, borderWidth: 1, justifyContent: 'center', minHeight: 50, minWidth: 110, paddingHorizontal: 16 }, secondaryText: { color: colors.mossText, fontSize: 16, fontWeight: '700' }, disabled: { opacity: 0.6 },
});
