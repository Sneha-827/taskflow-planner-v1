import { Priority } from '../types';
import { cn } from '../lib/utils';

interface PriorityBadgeProps {
  priority: Priority;
}

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const colors = {
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    medium: 'bg-slate-200 text-slate-700 border-slate-300',
    high: 'bg-black text-white border-black',
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border", colors[priority])}>
      {priority}
    </span>
  );
};
