import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint="/api/workouts/suggestions/mona@example.com"
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
