import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      endpoint="/api/activities"
      dataKey="activities"
      emptyText="No activities"
      renderItem={(item) => (
        <li key={String(item._id ?? item.type ?? 'activity')}>
          <span>{String(item.type ?? 'Activity')}</span> · <span>{String(item.minutes ?? 0)} min</span>
        </li>
      )}
    />
  );
}
