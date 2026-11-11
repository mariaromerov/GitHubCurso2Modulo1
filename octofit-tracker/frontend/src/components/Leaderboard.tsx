import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      dataKey="leaderboard"
      emptyText="No leaderboard scores"
      renderItem={(item) => (
        <li key={String(item.teamName ?? item.rank ?? 'leaderboard-item')}>
          {String(item.teamName ?? 'Team')} · {String(item.totalPoints ?? 0)}
        </li>
      )}
    />
  );
}
