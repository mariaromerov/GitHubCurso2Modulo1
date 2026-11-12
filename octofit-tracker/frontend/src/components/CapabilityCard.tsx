import { useEffect, useState } from 'react';

type Props = {
  title: string;
  description: string;
  loadData: () => Promise<Record<string, unknown>>;
  dataKey: string;
  emptyText: string;
  renderItem: (item: Record<string, unknown>, index: number) => React.ReactNode;
};

export function CapabilityCard({ title, description, loadData, dataKey, emptyText, renderItem }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        const payload = await loadData();
        if (cancelled) return;

        const values = Array.isArray((payload as Record<string, unknown>)[dataKey])
          ? ((payload as Record<string, unknown>)[dataKey] as Record<string, unknown>[])
          : [];

        setItems(values);
      } catch {
        if (!cancelled) {
          setError('Unable to load data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [dataKey, loadData]);

  if (loading) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p role="status">Loading...</p></div></section>;
  }

  if (error) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p role="alert">{error}</p></div></section>;
  }

  if (items.length === 0) {
    return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><p>{emptyText}</p></div></section>;
  }

  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p><ul className="mb-0">{items.map(renderItem)}</ul></div></section>;
}
