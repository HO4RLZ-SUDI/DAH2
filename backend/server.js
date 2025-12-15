import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const settings = {
  thresholds: {
    temperatureMax: 30,
    humidityMin: 45,
    tdsMax: 1200,
    phMin: 5.8,
    phMax: 6.5
  },
  ruleWindows: {
    tdsCriticalMinutes: 3,
    sensorTimeoutMinutes: 10
  },
  delays: {
    pumpCooldownSec: 30,
    curtainCooldownSec: 15,
    fanCooldownSec: 10
  }
};

const devices = {
  pump: false,
  curtain: false,
  fan: false,
  mode: 'AUTO',
  lastChanged: {
    pump: null,
    curtain: null,
    fan: null
  }
};

const activeAlerts = {
  tdsCritical: false,
  sensorError: false,
  emergency: false
};

let sensorHistory = [];
let currentSensor = {
  timestamp: Date.now(),
  temperature: 25,
  humidity: 55,
  tds: 900,
  ph: 6.2
};

const eventLog = [];
const pushEvent = (type, message, level = 'info') => {
  const entry = { type, message, level, timestamp: Date.now() };
  eventLog.unshift(entry);
  if (eventLog.length > 200) eventLog.pop();
};

const toggleDevice = (name, state) => {
  if (!['pump', 'curtain', 'fan'].includes(name)) return;
  const now = Date.now();
  if (devices[name] !== state) {
    devices[name] = state;
    devices.lastChanged[name] = now;
    pushEvent(`${name}_${state ? 'on' : 'off'}`, `${name} turned ${state ? 'on' : 'off'}`);
  }
};

const applyEmergency = () => {
  activeAlerts.emergency = true;
  devices.mode = 'EMERGENCY';
  toggleDevice('pump', false);
  toggleDevice('curtain', false);
  toggleDevice('fan', false);
};

const clearEmergency = () => {
  activeAlerts.emergency = false;
  devices.mode = 'AUTO';
};

const evaluateRules = () => {
  const now = Date.now();
  const staleMinutes = (now - currentSensor.timestamp) / 60000;

  if (staleMinutes > settings.ruleWindows.sensorTimeoutMinutes) {
    if (!activeAlerts.sensorError) pushEvent('sensor_error', 'Sensor data stale', 'critical');
    activeAlerts.sensorError = true;
  } else {
    activeAlerts.sensorError = false;
  }

  const criticalWindowMs = settings.ruleWindows.tdsCriticalMinutes * 60 * 1000;
  const recent = sensorHistory.filter(r => now - r.timestamp <= criticalWindowMs);
  const tdsHigh = recent.length > 0 && recent.every(r => r.tds > settings.thresholds.tdsMax);
  if (tdsHigh) {
    if (!activeAlerts.tdsCritical) pushEvent('tds_over', 'TDS exceeds maximum for sustained period', 'critical');
    activeAlerts.tdsCritical = true;
  } else {
    activeAlerts.tdsCritical = false;
  }

  if (!activeAlerts.emergency && devices.mode === 'AUTO') {
    if (currentSensor.temperature > settings.thresholds.temperatureMax) {
      toggleDevice('fan', true);
    } else if (currentSensor.temperature < settings.thresholds.temperatureMax - 1) {
      toggleDevice('fan', false);
    }
    if (currentSensor.tds > settings.thresholds.tdsMax) {
      toggleDevice('pump', false);
    } else if (currentSensor.tds < settings.thresholds.tdsMax - 50) {
      toggleDevice('pump', true);
    }
    if (currentSensor.humidity < settings.thresholds.humidityMin) {
      toggleDevice('curtain', false);
    } else {
      toggleDevice('curtain', true);
    }
  }

  if (devices.mode === 'EMERGENCY') {
    applyEmergency();
  }
};

const simulateSensorUpdate = () => {
  const jitter = () => (Math.random() * 2 - 1);
  currentSensor = {
    timestamp: Date.now(),
    temperature: Math.max(20, Math.min(35, currentSensor.temperature + jitter())),
    humidity: Math.max(30, Math.min(80, currentSensor.humidity + jitter())),
    tds: Math.max(700, Math.min(1400, currentSensor.tds + jitter() * 20)),
    ph: Math.max(5.5, Math.min(7.5, currentSensor.ph + jitter() * 0.05))
  };
  sensorHistory.unshift(currentSensor);
  if (sensorHistory.length > 500) sensorHistory.pop();
  evaluateRules();
};

setInterval(simulateSensorUpdate, 5000);

app.get('/sensor/current', (req, res) => {
  const now = Date.now();
  const online = (now - currentSensor.timestamp) / 60000 <= settings.ruleWindows.sensorTimeoutMinutes;
  res.json({
    sensor: currentSensor,
    online,
    devices,
    alerts: { ...activeAlerts },
    eventLog
  });
});

app.get('/sensor/history', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
  res.json({ history: sensorHistory.slice(0, limit).reverse() });
});

app.post('/device/:name', (req, res) => {
  const { name } = req.params;
  const { state, mode } = req.body || {};
  if (name === 'mode') {
    if (['AUTO', 'MANUAL', 'EMERGENCY'].includes(mode)) {
      devices.mode = mode;
      if (mode === 'EMERGENCY') {
        applyEmergency();
        pushEvent('emergency_trigger', 'Emergency mode activated', 'critical');
      } else {
        clearEmergency();
        pushEvent('mode_change', `Mode changed to ${mode}`, 'info');
      }
    }
    return res.json({ devices, alerts: activeAlerts });
  }

  if (activeAlerts.emergency || devices.mode === 'EMERGENCY') {
    return res.status(423).json({ error: 'Controls locked in emergency mode' });
  }
  if (!['pump', 'curtain', 'fan'].includes(name)) {
    return res.status(400).json({ error: 'Unknown device' });
  }
  if (devices.mode !== 'MANUAL') {
    return res.status(409).json({ error: 'Manual mode required for direct control' });
  }
  const desired = Boolean(state);
  toggleDevice(name, desired);
  res.json({ devices });
});

app.get('/settings', (req, res) => {
  res.json(settings);
});

app.post('/settings', (req, res) => {
  const body = req.body || {};
  if (body.thresholds) {
    settings.thresholds = { ...settings.thresholds, ...body.thresholds };
  }
  if (body.ruleWindows) {
    settings.ruleWindows = { ...settings.ruleWindows, ...body.ruleWindows };
  }
  if (body.delays) {
    settings.delays = { ...settings.delays, ...body.delays };
  }
  pushEvent('settings_update', 'Settings saved', 'info');
  res.json(settings);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Smart farm backend listening on ${port}`);
});
