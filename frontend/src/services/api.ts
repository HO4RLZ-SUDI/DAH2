import { DeviceState, SensorReading } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type SettingsPayload = {
  thresholds?: {
    temperatureMax?: number;
    humidityMin?: number;
    tdsMax?: number;
    phMin?: number;
    phMax?: number;
  };
  ruleWindows?: {
    tdsCriticalMinutes?: number;
    sensorTimeoutMinutes?: number;
  };
  delays?: {
    pumpCooldownSec?: number;
    curtainCooldownSec?: number;
    fanCooldownSec?: number;
  };
};

export const fetchCurrent = async () => {
  const res = await fetch(`${API_BASE}/sensor/current`);
  if (!res.ok) throw new Error('Failed to load sensor data');
  return res.json();
};

export const fetchSettings = async () => {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
};

export const fetchHistory = async () => {
  const res = await fetch(`${API_BASE}/sensor/history?limit=200`);
  if (!res.ok) throw new Error('Failed to load history');
  return res.json() as Promise<{ history: SensorReading[] }>;
};

export const sendDeviceCommand = async (
  name: keyof DeviceState | 'mode',
  body: { state?: boolean; mode?: DeviceState['mode'] }
) => {
  const res = await fetch(`${API_BASE}/device/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Command failed');
  }
  return res.json();
};

export const saveSettings = async (payload: SettingsPayload) => {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
};
