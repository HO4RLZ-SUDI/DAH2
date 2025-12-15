type Props = {
  title: string;
  value: number;
  unit: string;
  target?: string;
};

const StatCard = ({ title, value, unit, target }: Props) => (
  <div className="stat-card">
    <div className="muted text-xs">{title}</div>
    <div className="stat-value">
      {value.toFixed(1)} <span className="muted">{unit}</span>
    </div>
    {target && <div className="muted text-xs">{target}</div>}
  </div>
);

export default StatCard;
