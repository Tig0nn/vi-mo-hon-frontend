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

const USER_ID = 'mock-user';

const TABS = [
  { key: 'home', label: 'Home' },
  { key: 'boss', label: 'Boss' },
  { key: 'character', label: 'Character' },
  { key: 'profile', label: 'Profile' },
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
      setError('Please enter an expense before submitting.');
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
      return 'Backend connected';
    }

    if (healthStatus === 'failed') {
      return 'Backend failed';
    }

    return 'Checking backend...';
  }, [healthStatus]);

  const screenTitle = TABS.find((tab) => tab.key === activeTab)?.label ?? 'Home';

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Vi Mo Hon</Text>
          <Text style={styles.subtitle}>{screenTitle}</Text>
          <View style={[styles.statusPill, styles[healthStatus]]}>
            <Text style={styles.statusText}>{healthLabel}</Text>
          </View>
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
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.mutedText}>Loading dashboard...</Text>
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
          <Text style={styles.secondaryButtonText}>Refresh dashboard</Text>
        </Pressable>
      </ScrollView>

      <BottomTabs activeTab={activeTab} onChangeTab={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: '#f8fafc',
    flex: 1,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 104,
    paddingTop: 52,
  },
  header: {
    gap: 8,
  },
  appTitle: {
    color: '#0f172a',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#475569',
    fontSize: 17,
    fontWeight: '700',
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  checking: {
    backgroundColor: '#fef3c7',
  },
  connected: {
    backgroundColor: '#dcfce7',
  },
  failed: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: '#2563eb',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  secondaryButtonPressed: {
    backgroundColor: '#eff6ff',
    opacity: 0.75,
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontSize: 15,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  mutedText: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    left: 0,
    padding: 12,
    paddingBottom: 18,
    position: 'absolute',
    right: 0,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: '#eff6ff',
  },
  tabButtonPressed: {
    opacity: 0.7,
  },
  tabText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#1d4ed8',
  },
});
