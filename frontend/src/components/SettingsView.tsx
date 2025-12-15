import { FormEvent, useState } from 'react';
import { SettingsPayload } from '../services/api';

type Props = {
  initial: SettingsPayload | null;
  onSave: (payload: SettingsPayload) => void;
  loading?: boolean;
};

const SettingsView = ({ initial, onSave, loading }: Props) => {
  const [form, setForm] = useState<SettingsPayload>(
    initial || {
      thresholds: { temperatureMax: 30, humidityMin: 45, tdsMax: 1200, phMin: 5.8, phMax: 6.5 },
      ruleWindows: { tdsCriticalMinutes: 3, sensorTimeoutMinutes: 10 },
      delays: { pumpCooldownSec: 30, curtainCooldownSec: 15, fanCooldownSec: 10 }
    }
  );

  const update = (path: string, value: number) => {
    setForm((prev) => {
      const next = { ...prev } as any;
      const [group, key] = path.split('.');
      next[group] = { ...(prev as any)[group], [key]: value };
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Settings</h2>
        <span className="badge muted">Thresholds & Timing</span>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Temp Max (°C)
          <input
            type="number"
            step="0.5"
            value={form.thresholds?.temperatureMax ?? 0}
            onChange={(e) => update('thresholds.temperatureMax', parseFloat(e.target.value))}
          />
        </label>
        <label>
          Humidity Min (%)
          <input
            type="number"
            step="1"
            value={form.thresholds?.humidityMin ?? 0}
            onChange={(e) => update('thresholds.humidityMin', parseFloat(e.target.value))}
          />
        </label>
        <label>
          TDS Max (ppm)
          <input
            type="number"
            step="10"
            value={form.thresholds?.tdsMax ?? 0}
            onChange={(e) => update('thresholds.tdsMax', parseInt(e.target.value, 10))}
          />
        </label>
        <label>
          pH Min
          <input
            type="number"
            step="0.1"
            value={form.thresholds?.phMin ?? 0}
            onChange={(e) => update('thresholds.phMin', parseFloat(e.target.value))}
          />
        </label>
        <label>
          pH Max
          <input
            type="number"
            step="0.1"
            value={form.thresholds?.phMax ?? 0}
            onChange={(e) => update('thresholds.phMax', parseFloat(e.target.value))}
          />
        </label>
        <label>
          TDS Critical Window (min)
          <input
            type="number"
            step="1"
            value={form.ruleWindows?.tdsCriticalMinutes ?? 0}
            onChange={(e) => update('ruleWindows.tdsCriticalMinutes', parseInt(e.target.value, 10))}
          />
        </label>
        <label>
          Sensor Timeout (min)
          <input
            type="number"
            step="1"
            value={form.ruleWindows?.sensorTimeoutMinutes ?? 0}
            onChange={(e) => update('ruleWindows.sensorTimeoutMinutes', parseInt(e.target.value, 10))}
          />
        </label>
        <label>
          Pump Cooldown (s)
          <input
            type="number"
            step="1"
            value={form.delays?.pumpCooldownSec ?? 0}
            onChange={(e) => update('delays.pumpCooldownSec', parseInt(e.target.value, 10))}
          />
        </label>
        <label>
          Curtain Cooldown (s)
          <input
            type="number"
            step="1"
            value={form.delays?.curtainCooldownSec ?? 0}
            onChange={(e) => update('delays.curtainCooldownSec', parseInt(e.target.value, 10))}
          />
        </label>
        <label>
          Fan Cooldown (s)
          <input
            type="number"
            step="1"
            value={form.delays?.fanCooldownSec ?? 0}
            onChange={(e) => update('delays.fanCooldownSec', parseInt(e.target.value, 10))}
          />
        </label>
        <div className="form-actions">
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SettingsView;
