import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { apiGet, apiPost } from './src/api/client';
import { BossScreen } from './src/screens/BossScreen';
import { CharacterScreen } from './src/screens/CharacterScreen';
import { CoachScreen } from './src/screens/CoachScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isCompleteProfile } from './src/utils/profile';


const TABS = [
  { key: 'home', label: 'Trang chủ', icon: 'TC' },
  { key: 'boss', label: 'Boss', icon: 'B' },
  { key: 'coach', label: 'Coach', icon: 'C' },
  { key: 'character', label: 'Nhân vật', icon: 'NV' },
  { key: 'profile', label: 'Hồ sơ', icon: 'HS' },
];

function BottomTabs({ activeTab, onChangeTab }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChangeTab(tab.key)}
            style={({ pressed }) => [
              styles.tabButton,
              isActive && styles.activeTabButton,
              pressed && styles.tabButtonPressed,
            ]}
          >
            <View style={[styles.tabIcon, isActive && styles.activeTabIcon]}>
              <Text
                style={[
                  styles.tabIconText,
                  isActive && styles.activeTabIconText,
                ]}
              >
                {tab.icon}
              </Text>
            </View>

            <Text
              numberOfLines={1}
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function profileFromResponse(response) {
  return response?.data?.profile ?? response?.profile ?? response?.data ?? response;
}

function AppHeader({ screenTitle }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Text style={styles.appTitle}>Mỏ Hỗn</Text>
      </View>
      <Text style={styles.subtitle}>{screenTitle}</Text>
    </View>
  );
}

export default function App() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [dashboard, setDashboard] = useState(null);
  const [expenseText, setExpenseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completingChallengeId, setCompletingChallengeId] = useState(null);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await apiGet(`/dashboard/${userId}`);
      setDashboard(response);
    } catch (dashboardError) {
      setError(dashboardError.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    async function bootstrap() {
      setIsBootstrapping(true);
      setBootstrapError('');
      try {
        let storedUserId = await AsyncStorage.getItem('vmh_user_id');
        if (!storedUserId) {
          storedUserId = `vmh_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
          await AsyncStorage.setItem('vmh_user_id', storedUserId);
        }
        setUserId(storedUserId);

        try {
          const response = await apiGet(`/profile/${storedUserId}`);
          const nextProfile = profileFromResponse(response);
          setProfile(nextProfile);
          setNeedsOnboarding(!isCompleteProfile(nextProfile));
        } catch (profileError) {
          if (profileError.status === 404) {
            setProfile(null);
            setNeedsOnboarding(true);
          } else {
            setBootstrapError(profileError.message || 'Không thể kết nối máy chủ.');
          }
        }
      } catch (bootstrapFailure) {
        setBootstrapError(bootstrapFailure.message || 'Không thể khởi động ứng dụng.');
      } finally {
        setIsBootstrapping(false);
      }
    }
    bootstrap();
  }, []);

  useEffect(() => {
    if (!isBootstrapping && !bootstrapError && !needsOnboarding && userId) {
      loadDashboard();
    }
  }, [isBootstrapping, bootstrapError, needsOnboarding, userId, loadDashboard]);

  const handleSubmitExpense = async () => {
    const trimmedText = expenseText.trim();

    if (!trimmedText) {
      setError('Vui lòng nhập khoản chi trước khi gửi.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiPost('/expenses/quick-input', {
        userId,
        text: trimmedText,
      });
      setExpenseText('');
      await loadDashboard();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    setCompletingChallengeId(challengeId);
    setError('');

    try {
      await apiPost(`/challenges/${challengeId}/complete`, {
        userId,
      });
      await loadDashboard();
    } catch (challengeError) {
      setError(challengeError.message);
    } finally {
      setCompletingChallengeId(null);
    }
  };

  const screenTitle = TABS.find((tab) => tab.key === activeTab)?.label ?? 'Trang chủ';

  if (isBootstrapping) {
    return (
      <View style={[styles.app, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (bootstrapError) {
    return (
      <View style={styles.startupError}>
        <Text style={styles.startupErrorTitle}>Chưa thể kết nối</Text>
        <Text style={styles.startupErrorText}>{bootstrapError}</Text>
        <Pressable onPress={() => {
          setIsBootstrapping(true);
          setBootstrapError('');
          const retry = async () => {
            try {
              const storedUserId = await AsyncStorage.getItem('vmh_user_id');
              if (!storedUserId) throw new Error('Chưa tạo được mã thiết bị.');
              const response = await apiGet(`/profile/${storedUserId}`);
              const nextProfile = profileFromResponse(response);
              setUserId(storedUserId);
              setProfile(nextProfile);
              setNeedsOnboarding(!isCompleteProfile(nextProfile));
            } catch (retryError) {
              if (retryError.status === 404) {
                setNeedsOnboarding(true);
              } else {
                setBootstrapError(retryError.message || 'Không thể kết nối máy chủ.');
              }
            } finally {
              setIsBootstrapping(false);
            }
          };
          retry();
        }} style={styles.retryButton}><Text style={styles.retryButtonText}>Thử lại</Text></Pressable>
      </View>
    );
  }

  if (needsOnboarding) {
    return (
      <OnboardingScreen
        userId={userId}
        initialProfile={profile}
        onFinish={(nextProfile) => {
          setProfile(nextProfile);
          setNeedsOnboarding(false);
          setActiveTab('home');
        }}
      />
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      {activeTab === 'coach' ? (
        <View style={styles.coachContent}>
          <AppHeader screenTitle={screenTitle} />
          <CoachScreen dashboard={dashboard} userId={userId} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <AppHeader screenTitle={screenTitle} />

          {error ? (
            <View style={styles.errorBox}>
              <Text selectable style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.mutedText}>Đang tải dashboard...</Text>
            </View>
          ) : null}

          {activeTab === 'home' ? (
            <HomeScreen
              dashboard={dashboard}
              expenseText={expenseText}
              isLoading={isLoading}
              onChangeExpenseText={setExpenseText}
              onSubmitExpense={handleSubmitExpense}
            />
          ) : null}

          {activeTab === 'boss' ? (
            <BossScreen
              dashboard={dashboard}
              completingChallengeId={completingChallengeId}
              onCompleteChallenge={handleCompleteChallenge}
            />
          ) : null}

          {activeTab === 'character' ? <CharacterScreen dashboard={dashboard} /> : null}
          {activeTab === 'profile' ? (
            <ProfileScreen dashboard={dashboard} profile={profile} userId={userId} onRefreshDashboard={loadDashboard} />
          ) : null}
        </ScrollView>
      )}

      <BottomTabs activeTab={activeTab} onChangeTab={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.appCanvas,
    flex: 1,
    ...(Platform.OS === 'web' ? { height: '100vh' } : null),
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 120,
    paddingTop: 60,
  },
  coachContent: {
    flex: 1,
    gap: 16,
    paddingBottom: 112,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  headerTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  appTitle: {
    color: colors.primary,
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    fontSize: 16,
    fontWeight: '600',
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
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  mutedText: {
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
  },
  startupError: { alignItems: 'center', backgroundColor: colors.appCanvas, flex: 1, gap: 14, justifyContent: 'center', padding: 24 },
  startupErrorTitle: { color: colors.primary, fontSize: 24, fontWeight: '800' },
  startupErrorText: { color: colors.onSurfaceVariant, fontSize: 16, lineHeight: 24, textAlign: 'center' },
  retryButton: { backgroundColor: colors.primary, borderRadius: 12, marginTop: 8, minWidth: 128, paddingHorizontal: 16, paddingVertical: 14 },
  retryButtonText: { color: colors.surfaceRice, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  tabBar: {
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    left: 0,
    padding: 12,
    paddingBottom: 24,
    position: 'absolute',
    right: 0,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: colors.primaryContainer,
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  tabIcon: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMist,
    borderColor: colors.softBorder,
    borderRadius: 999,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginBottom: 4,
    width: 24,
  },
  activeTabIcon: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabIconText: {
    color: colors.mossText,
    fontSize: 9,
    fontWeight: '800',
  },
  activeTabIconText: {
    color: colors.surfaceRice,
  },
  tabText: {
    color: colors.mossText,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.onPrimaryContainer,
    fontWeight: '700',
  },
});
