import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Trash2, Briefcase, User, Clock } from 'lucide-react';
import { Task } from '../types';
import { cn, formatDate } from '../lib/utils';
import { PriorityBadge } from './PriorityBadge';

interface TaskCardProps {
  task: Task;
  viewTemplate: 'grid' | 'list';
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, viewTemplate, onToggle, onDelete, onEdit }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer",
        viewTemplate === 'grid' ? "p-6" : "p-4 flex items-center gap-4",
        task.completed && "opacity-75"
      )}
      onClick={() => onEdit(task)}
    >
      <div className={cn("flex items-start justify-between", viewTemplate === 'list' && "hidden")}>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={cn(
            "mt-1 transition-colors",
            task.completed ? "text-black" : "text-slate-300 hover:text-slate-600"
          )}
        >
          {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>
        <div className="flex gap-2">
          <PriorityBadge priority={task.priority} />
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
            className="text-slate-300 hover:text-black transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {viewTemplate === 'list' && (
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className={cn(
            "transition-colors shrink-0",
            task.completed ? "text-black" : "text-slate-300 hover:text-slate-600"
          )}
        >
          {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
        </button>
      )}

      <div className="flex-1 min-w-0">
        <h3 className={cn("text-lg font-semibold truncate text-slate-900", task.completed && "line-through text-slate-400")}>
          {task.title}
        </h3>
        {viewTemplate === 'grid' && (
          <p className="text-slate-500 text-sm mb-4 line-clamp-2">{task.description}</p>
        )}
      </div>

      {viewTemplate === 'grid' && task.subtasks.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400">
            <span>Subtasks</span>
            <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-black h-full transition-all duration-500" 
              style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }}
            />
          </div>
          <div className="space-y-1">
            {task.subtasks.slice(0, 3).map(sub => (
              <div key={sub.id} className="flex items-center gap-2 text-xs text-slate-500">
                <div className={cn("w-3 h-3 rounded-full border", sub.completed ? "bg-black border-black" : "border-slate-300")} />
                <span className={cn(sub.completed && "line-through")}>{sub.title}</span>
              </div>
            ))}
            {task.subtasks.length > 3 && (
              <span className="text-[10px] text-slate-400 font-medium">+{task.subtasks.length - 3} more subtasks</span>
            )}
          </div>
        </div>
      )}

      <div className={cn(
        "flex items-center justify-between",
        viewTemplate === 'grid' ? "pt-4 border-t border-slate-100" : "gap-4 shrink-0"
      )}>
        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
          {task.category === 'work' ? <Briefcase size={14} /> : <User size={14} />}
          <span className="capitalize hidden sm:inline">{task.category}</span>
        </div>
        
        {viewTemplate === 'list' && <PriorityBadge priority={task.priority} />}

        {task.deadline && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Clock size={14} />
            <span>{formatDate(task.deadline)}</span>
          </div>
        )}

        {viewTemplate === 'list' && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
            className="text-slate-300 hover:text-black transition-colors ml-2"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
