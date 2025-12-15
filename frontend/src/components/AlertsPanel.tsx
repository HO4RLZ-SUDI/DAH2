import { AlertState } from '../types';

const ALERTS = [
  { key: 'tdsCritical', label: 'TDS Critical', level: 'warning' },
  { key: 'sensorError', label: 'Sensor Error', level: 'danger' },
  { key: 'emergency', label: 'Emergency Lock', level: 'danger' }
] as const;

type Props = {
  alerts: AlertState;
};

const AlertsPanel = ({ alerts }: Props) => {
  return (
    <div className="alert-list">
      {ALERTS.map((item) => (
        <div key={item.key} className={`alert ${alerts[item.key] ? item.level : 'muted'}`}>
          <div>{item.label}</div>
          <div className="status-dot" data-active={alerts[item.key]} />
        </div>
      ))}
    </div>
  );
};

export default AlertsPanel;
