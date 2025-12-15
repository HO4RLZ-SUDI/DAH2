type Props = {
  value: number;
  min?: number;
  max: number;
  label: string;
};

const Gauge = ({ value, min = 0, max, label }: Props) => {
  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  return (
    <div className="gauge">
      <div className="gauge-arc">
        <div className="gauge-fill" style={{ transform: `rotate(${(percentage / 100) * 180}deg)` }} />
        <div className="gauge-cover">
          <div className="gauge-value">{value.toFixed(1)}</div>
          <div className="muted text-xs">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default Gauge;
