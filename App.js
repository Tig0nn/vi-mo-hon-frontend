import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { colors } from './src/theme/colors';

const USER_ID = 'mock-user';

const TABS = [
  { key: 'home', label: 'Trang chủ', icon: 'TC' },
  { key: 'boss', label: 'Boss', icon: 'B' },
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
              <Text style={[styles.tabIconText, isActive && styles.activeTabIconText]}>
                {tab.icon}
              </Text>
            </View>
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [healthStatus, setHealthStatus] = useState('checking');
  const [dashboard, setDashboard] = useState(null);
  const [expenseText, setExpenseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completingChallengeId, setCompletingChallengeId] = useState(null);
  const [error, setError] = useState('');

  const loadHealth = useCallback(async () => {
    try {
      await apiGet('/health');
      setHealthStatus('connected');
    } catch (healthError) {
      setHealthStatus('failed');
      setError(healthError.message);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiGet(`/dashboard/${USER_ID}`);
      setDashboard(response);
    } catch (dashboardError) {
      setError(dashboardError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
    loadDashboard();
  }, [loadDashboard, loadHealth]);

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
        userId: USER_ID,
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
        userId: USER_ID,
      });
      await loadDashboard();
    } catch (challengeError) {
      setError(challengeError.message);
    } finally {
      setCompletingChallengeId(null);
    }
  };

  const healthLabel = useMemo(() => {
    if (healthStatus === 'connected') {
      return 'Backend đã kết nối';
    }

    if (healthStatus === 'failed') {
      return 'Backend lỗi';
    }

    return 'Đang kiểm tra backend...';
  }, [healthStatus]);

  const screenTitle = TABS.find((tab) => tab.key === activeTab)?.label ?? 'Trang chủ';

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.appTitle}>Ví Mỏ Hỗn</Text>
            <View style={[styles.statusPill, styles[healthStatus]]}>
              <Text style={[styles.statusText, styles[`${healthStatus}Text`]]}>
                {healthLabel}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{screenTitle}</Text>
        </View>

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
        {activeTab === 'profile' ? <ProfileScreen dashboard={dashboard} /> : null}

        <Pressable
          disabled={isLoading}
          onPress={loadDashboard}
          style={({ pressed }) => [
            styles.secondaryButton,
            (pressed || isLoading) && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Làm mới dashboard</Text>
        </Pressable>
      </ScrollView>

      <BottomTabs activeTab={activeTab} onChangeTab={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.appCanvas,
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 120,
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
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  checking: {
    backgroundColor: colors.surfaceMist,
  },
  checkingText: {
    color: colors.mossText,
  },
  connected: {
    backgroundColor: colors.primaryContainer,
  },
  connectedText: {
    color: colors.onPrimaryContainer,
  },
  failed: {
    backgroundColor: colors.error,
  },
  failedText: {
    color: colors.surfaceRice,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surfaceRice,
    borderColor: colors.softBorder,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 16,
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
    minHeight: 52,
    paddingHorizontal: 4,
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
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.onPrimaryContainer,
    fontWeight: '700',
  },
});
