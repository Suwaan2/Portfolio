import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Reference } from '../../types/ai';

export function ProjectReference({ refs }: { refs: Reference[] }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {refs.map((ref) => (
        <Link
          key={ref.id}
          to={ref.url}
          className="group flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 transition-colors hover:bg-primary/20"
        >
          <span className="font-label text-sm text-primary group-hover:underline">{ref.label}</span>
          <ArrowRight size={16} className="text-primary transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}