import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import { SensorReading } from '../types';

type Props = {
  history: SensorReading[];
};

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString();

const HistoryView = ({ history }: Props) => {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>History</h2>
        <span className="badge muted">Last {history.length} samples</span>
      </div>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={40} />
            <YAxis yAxisId="left" />
            <YAxis orientation="right" yAxisId="right" />
            <Tooltip labelFormatter={(v) => formatTime(Number(v))} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#f97316" dot={false} name="Temp" />
            <Line yAxisId="left" type="monotone" dataKey="humidity" stroke="#22c55e" dot={false} name="Humidity" />
            <Line yAxisId="right" type="monotone" dataKey="tds" stroke="#38bdf8" dot={false} name="TDS" />
            <Line yAxisId="right" type="monotone" dataKey="ph" stroke="#c084fc" dot={false} name="pH" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default HistoryView;
