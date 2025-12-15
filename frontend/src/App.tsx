import { useEffect, useMemo, useState } from 'react';
import DashboardView from './components/DashboardView';
import ControlView from './components/ControlView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import {
  fetchCurrent,
  fetchHistory,
  fetchSettings,
  saveSettings,
  sendDeviceCommand,
  SettingsPayload
} from './services/api';
import { DeviceState, EventLogEntry, SensorReading } from './types';

const TABS = ['dashboard', 'control', 'history', 'settings'] as const;
type Tab = typeof TABS[number];

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sensor, setSensor] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [devices, setDevices] = useState<DeviceState | null>(null);
  const [online, setOnline] = useState(true);
  const [alerts, setAlerts] = useState({ tdsCritical: false, sensorError: false, emergency: false });
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [loading, setLoading] = useState(false);

  const loadCurrent = async () => {
    const data = await fetchCurrent();
    setSensor(data.sensor);
    setDevices(data.devices);
    setOnline(data.online);
    setAlerts(data.alerts);
    setEventLog(data.eventLog || []);
  };

  const loadHistory = async () => {
    const data = await fetchHistory();
    setHistory(data.history);
  };

  const loadSettings = async () => {
    const data = await fetchSettings();
    setSettings(data);
  };

  useEffect(() => {
    const loop = setInterval(() => {
      loadCurrent();
      loadHistory();
      loadSettings();
    }, 5000);
    loadCurrent();
    loadHistory();
    loadSettings();
    return () => clearInterval(loop);
  }, []);

  const tabTitle = useMemo(() => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'control':
        return 'Control';
      case 'history':
        return 'History';
      case 'settings':
        return 'Settings';
      default:
        return '';
    }
  }, [tab]);

  const handleModeChange = async (mode: DeviceState['mode']) => {
    await sendDeviceCommand('mode', { mode });
    loadCurrent();
  };

  const handleDeviceToggle = async (name: keyof DeviceState, state: boolean) => {
    await sendDeviceCommand(name, { state });
    loadCurrent();
  };

  const handleSettingsSave = async (payload: SettingsPayload) => {
    setLoading(true);
    await saveSettings(payload);
    await loadCurrent();
    setSettings(payload);
    setLoading(false);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <div className="eyebrow">Smart Farm / Hydroponics</div>
          <h1>{tabTitle}</h1>
        </div>
        <div className="header-actions">
          <button className="pill" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <nav className="tabs">
            {TABS.map((key) => (
              <button key={key} className={tab === key ? 'tab active' : 'tab'} onClick={() => setTab(key)}>
                {key.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main>
        {tab === 'dashboard' && (
          <DashboardView
            sensor={sensor}
            devices={devices}
            alerts={alerts}
            eventLog={eventLog}
            online={online}
          />
        )}
        {tab === 'control' && (
          <ControlView
            devices={devices}
            onModeChange={handleModeChange}
            onToggle={handleDeviceToggle}
            alerts={alerts}
          />
        )}
        {tab === 'history' && <HistoryView history={history} />}
        {tab === 'settings' && (
          <SettingsView
            initial={settings}
            loading={loading}
            onSave={handleSettingsSave}
          />
        )}
      </main>
    </div>
  );
}

export default App;
