import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadActivities = () => getJson<Record<string, unknown>>('/api/activities');

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      loadData={loadActivities}
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
