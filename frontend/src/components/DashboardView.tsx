import Gauge from './Gauge';
import StatCard from './StatCard';
import AlertsPanel from './AlertsPanel';
import { AlertState, DeviceState, EventLogEntry, SensorReading } from '../types';

type Props = {
  sensor: SensorReading | null;
  devices: DeviceState | null;
  alerts: AlertState;
  eventLog: EventLogEntry[];
  online: boolean;
};

const DashboardView = ({ sensor, devices, alerts, eventLog, online }: Props) => {
  return (
    <div className="grid">
      <section className="panel col-span-2">
        <div className="panel-header">
          <h2>Environment</h2>
          <span className={online ? 'badge success' : 'badge danger'}>{online ? 'Online' : 'Offline'}</span>
        </div>
        <div className="stat-grid">
          <StatCard title="Temperature" value={sensor?.temperature ?? 0} unit="°C" target="Max setpoint" />
          <StatCard title="Humidity" value={sensor?.humidity ?? 0} unit="%" target="Comfort band" />
          <StatCard title="TDS" value={sensor?.tds ?? 0} unit="ppm" target="Nutrient" />
          <StatCard title="pH" value={sensor?.ph ?? 0} unit="" target="Water balance" />
        </div>
        <div className="gauges">
          <Gauge value={sensor?.temperature ?? 0} max={40} label="Temperature" />
          <Gauge value={sensor?.humidity ?? 0} max={100} label="Humidity" />
          <Gauge value={sensor?.tds ?? 0} max={1500} label="TDS" />
          <Gauge value={sensor?.ph ?? 0} max={7.5} min={5.5} label="pH" />
        </div>
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Alerts</h2>
          <span className="badge">{alerts.tdsCritical || alerts.sensorError || alerts.emergency ? 'Active' : 'Clear'}</span>
        </div>
        <AlertsPanel alerts={alerts} />
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Event Log</h2>
          <span className="badge muted">Latest</span>
        </div>
        <div className="log-list">
          {eventLog.slice(0, 10).map((entry) => (
            <div key={entry.timestamp} className={`log-row ${entry.level}`}>
              <div>{new Date(entry.timestamp).toLocaleTimeString()}</div>
              <div>{entry.message}</div>
            </div>
          ))}
          {eventLog.length === 0 && <div className="muted">No events yet</div>}
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
