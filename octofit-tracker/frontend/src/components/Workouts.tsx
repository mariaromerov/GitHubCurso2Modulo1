import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

const loadWorkouts = () => getJson<Record<string, unknown>>('/api/workouts/suggestions/mona@example.com');

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loadData={loadWorkouts}
      dataKey="suggestions"
      emptyText="No workout suggestions"
      renderItem={(item) => (
        <li key={String(item.title ?? item.focus ?? 'workout')}>
          {String(item.title ?? 'Workout')}
        </li>
      )}
    />
  );
}
