import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadTeams = () => getJson<Record<string, unknown>>('/api/teams');

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      loadData={loadTeams}
      dataKey="teams"
      emptyText="No teams"
      renderItem={(item) => (
        <li key={String(item._id ?? item.name ?? 'team')}>
          {String(item.name ?? 'Team')}
        </li>
      )}
    />
  );
}
