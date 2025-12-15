import { AlertState, DeviceState } from '../types';

type Props = {
  devices: DeviceState | null;
  onModeChange: (mode: DeviceState['mode']) => void;
  onToggle: (name: keyof DeviceState, state: boolean) => void;
  alerts: AlertState;
};

const ControlView = ({ devices, onModeChange, onToggle, alerts }: Props) => {
  const isLocked = alerts.emergency || devices?.mode === 'EMERGENCY';
  return (
    <div className="grid">
      <section className="panel">
        <div className="panel-header">
          <h2>Mode</h2>
          <span className="badge">{devices?.mode || 'AUTO'}</span>
        </div>
        <div className="button-row">
          {(['AUTO', 'MANUAL', 'EMERGENCY'] as DeviceState['mode'][]).map((mode) => (
            <button
              key={mode}
              className={devices?.mode === mode ? 'btn primary' : 'btn'}
              onClick={() => onModeChange(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
        <p className="muted text-sm">Emergency locks all controls and turns everything off.</p>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Devices</h2>
          <span className="badge muted">Manual only</span>
        </div>
        <div className="button-row">
          {(['pump', 'curtain', 'fan'] as (keyof DeviceState)[]).map((device) => (
            <button
              key={device}
              className={`btn ${devices?.[device] ? 'primary' : ''}`}
              onClick={() => onToggle(device, !devices?.[device])}
              disabled={devices?.mode !== 'MANUAL' || isLocked}
            >
              {device.toUpperCase()} {devices?.[device] ? 'ON' : 'OFF'}
            </button>
          ))}
        </div>
        <button className="btn danger" onClick={() => onModeChange('EMERGENCY')}>
          EMERGENCY STOP
        </button>
      </section>
    </div>
  );
};

export default ControlView;
