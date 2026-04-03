import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore, isAfter } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/utils';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask: (date: Date) => void;
}

export const CalendarView = ({ tasks, onEditTask, onAddTask }: CalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="bg-white rounded-3xl p-4 md:p-8 border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[700px] md:min-w-0 grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden border border-slate-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-slate-50 p-3 text-center text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
          {days.map((day, idx) => {
            const dayTasks = tasks.filter(t => {
              if (t.completed || !t.deadline) return false;
              const deadline = new Date(t.deadline);
              const createdAt = new Date(t.createdAt);
              
              // Show if day is between creation and deadline
              return (isSameDay(day, deadline) || isBefore(day, deadline)) && 
                     (isSameDay(day, createdAt) || isAfter(day, createdAt));
            });
            return (
              <div 
                key={day.toString()} 
                onClick={() => onAddTask(day)}
                className={cn(
                  "bg-white min-h-[100px] md:min-h-[120px] p-2 transition-colors hover:bg-slate-50/50 cursor-pointer group/day",
                  idx === 0 && `col-start-${day.getDay() + 1}`
                )}
              >
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <span className={cn(
                    "text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition-colors",
                    isToday(day) ? "bg-black text-white" : "text-slate-600 group-hover/day:bg-slate-100"
                  )}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      className="text-[9px] md:text-[10px] p-1 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate font-medium hover:bg-black hover:text-white hover:border-black transition-all"
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
