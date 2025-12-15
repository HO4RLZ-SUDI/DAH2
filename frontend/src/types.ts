export type SensorReading = {
  timestamp: number;
  temperature: number;
  humidity: number;
  tds: number;
  ph: number;
};

export type DeviceState = {
  pump: boolean;
  curtain: boolean;
  fan: boolean;
  mode: 'AUTO' | 'MANUAL' | 'EMERGENCY';
  lastChanged?: Record<string, number | null>;
};

export type AlertState = {
  tdsCritical: boolean;
  sensorError: boolean;
  emergency: boolean;
};

export type EventLogEntry = {
  type: string;
  message: string;
  level: string;
  timestamp: number;
};
