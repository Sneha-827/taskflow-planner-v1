import React, { useMemo, useState } from 'react';
import { LayoutDashboard, AlertCircle, Plus, Calendar } from 'lucide-react';
import { isToday, isTomorrow, isAfter, startOfToday, startOfTomorrow, addDays } from 'date-fns';
import { Task, DashboardStats } from '../types';
import { cn } from '../lib/utils';
import { TaskCard } from './TaskCard';

type DateFilter = 'all' | 'today' | 'tomorrow' | 'upcoming';

interface DashboardProps {
  tasks: Task[];
  stats: DashboardStats;
  filter: 'all' | 'work' | 'personal';
  setFilter: (f: 'all' | 'work' | 'personal') => void;
  viewTemplate: 'grid' | 'list';
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onAddNew: () => void;
  onSave: (task: Partial<Task>) => void;
}

export const Dashboard = ({ 
  tasks, 
  stats, 
  filter, 
  setFilter, 
  viewTemplate, 
  onToggle, 
  onDelete, 
  onEdit, 
  onAddNew,
  onSave
}: DashboardProps) => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTaskTitle.trim()) {
      onSave({
        title: quickTaskTitle.trim(),
        category: filter === 'all' ? 'personal' : filter,
        priority: 'medium',
      });
      setQuickTaskTitle('');
    }
  };

  const filteredTasks = useMemo(() => {
    // Global filter: Hide completed tasks from dashboard views
    let result = tasks.filter(t => !t.completed && (filter === 'all' || t.category === filter));
    
    if (dateFilter !== 'all') {
      const today = startOfToday();
      const tomorrow = startOfTomorrow();
      
      result = result.filter(t => {
        if (!t.deadline) return dateFilter === 'upcoming';
        const deadline = new Date(t.deadline);
        
        if (dateFilter === 'today') {
          // Show if deadline is today or in the future
          return isAfter(deadline, today) || isToday(deadline);
        }
        if (dateFilter === 'tomorrow') {
          // Show if deadline is tomorrow or in the future
          return isAfter(deadline, tomorrow) || isTomorrow(deadline);
        }
        if (dateFilter === 'upcoming') {
          // Show if deadline is after tomorrow
          return isAfter(deadline, addDays(today, 1)) && !isTomorrow(deadline);
        }
        return true;
      });
    }
    
    return result;
  }, [tasks, filter, dateFilter]);

  const highPriorityTasks = useMemo(() => filteredTasks.filter(t => t.priority === 'high' && !t.completed), [filteredTasks]);
  const otherTasks = useMemo(() => filteredTasks.filter(t => t.priority !== 'high' || t.completed), [filteredTasks]);

  return (
    <div className="space-y-12">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">My Tasks</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">You have {stats.total - stats.completed} pending tasks today.</p>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
            {(['all', 'work', 'personal'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap min-w-[80px]",
                  filter === f 
                    ? "bg-black text-white shadow-md" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
            {(['all', 'today', 'tomorrow', 'upcoming'] as const).map((df) => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap min-w-[80px]",
                  dateFilter === df 
                    ? "bg-black text-white shadow-md" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {df}
              </button>
            ))}
          </div>
        </div>
      </header>

      {highPriorityTasks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-black">
            <AlertCircle size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest">High Priority</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highPriorityTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                viewTemplate={viewTemplate} 
                onToggle={onToggle} 
                onDelete={onDelete} 
                onEdit={onEdit}
              />
            ))}
          </div>
        </section>
      )}

      <form onSubmit={handleQuickSubmit} className="relative group mb-8">
        <input 
          type="text"
          value={quickTaskTitle}
          onChange={(e) => setQuickTaskTitle(e.target.value)}
          placeholder="Quickly add a task and press Enter..."
          className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all text-lg"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors">
          <Plus size={24} />
        </div>
        <button 
          type="submit"
          disabled={!quickTaskTitle.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-black text-white rounded-xl text-sm font-bold shadow-lg shadow-black/20 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </form>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400">
          <LayoutDashboard size={20} />
          <h2 className="text-sm font-bold uppercase tracking-widest">All Tasks</h2>
        </div>
        <div className={cn(
          viewTemplate === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-3"
        )}>
          {otherTasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              viewTemplate={viewTemplate} 
              onToggle={onToggle} 
              onDelete={onDelete} 
              onEdit={onEdit}
            />
          ))}
          <button
            onClick={onAddNew}
            className={cn(
              "flex flex-col items-center justify-center gap-3 bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-black transition-all group",
              viewTemplate === 'grid' ? "min-h-[200px]" : "py-4 flex-row"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="font-medium">Add New Task</span>
          </button>
        </div>
      </section>
    </div>
  );
};
