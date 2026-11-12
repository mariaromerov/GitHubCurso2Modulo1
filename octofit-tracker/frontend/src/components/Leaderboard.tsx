import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadLeaderboard = () => getJson<Record<string, unknown>>('/api/leaderboard');

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      loadData={loadLeaderboard}
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
