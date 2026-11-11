import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
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
