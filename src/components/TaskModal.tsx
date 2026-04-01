import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, CheckCircle, Trash2 } from 'lucide-react';
import { Task, Subtask, Category, Priority } from '../types';
import { cn } from '../lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  editingTask: Task | null;
}

export const TaskModal = ({ isOpen, onClose, onSave, editingTask }: TaskModalProps) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>(editingTask?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { id: Math.random().toString(36).substr(2, 9), title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSave({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            category: formData.get('category') as Category,
            priority: formData.get('priority') as Priority,
            deadline: formData.get('deadline') ? new Date(formData.get('deadline') as string).toISOString() : undefined,
            notificationTime: parseInt(formData.get('notificationTime') as string),
            subtasks: subtasks,
          });
        }} className="flex flex-col h-full">
          <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <Plus className="rotate-45" size={24} />
            </button>
          </div>

          <div className="p-8 pt-4 space-y-6 overflow-y-auto flex-1">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task Title</label>
                <input 
                  name="title"
                  required
                  defaultValue={editingTask?.title}
                  placeholder="Add a new task..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-black focus:ring-4 focus:ring-black/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea 
                  name="description"
                  rows={2}
                  defaultValue={editingTask?.description}
                  placeholder="Add more details about this task..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-black focus:ring-4 focus:ring-black/10 outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select name="category" defaultValue={editingTask?.category || 'personal'} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-black outline-none transition-all">
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
                  <select name="priority" defaultValue={editingTask?.priority || 'medium'} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-black outline-none transition-all">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deadline</label>
                  <input 
                    name="deadline"
                    type="datetime-local"
                    defaultValue={editingTask?.deadline ? new Date(editingTask.deadline).toISOString().slice(0, 16) : ''}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-black outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notify Me</label>
                  <select name="notificationTime" defaultValue={editingTask?.notificationTime || 60} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-black outline-none transition-all">
                    <option value="15">15 mins before</option>
                    <option value="30">30 mins before</option>
                    <option value="60">1 hour before</option>
                    <option value="1440">1 day before</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Subtasks</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                    placeholder="Add a subtask..."
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-black outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={handleAddSubtask}
                    className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                  {subtasks.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => toggleSubtask(s.id)}
                          className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", s.completed ? "bg-black border-black text-white" : "border-slate-300")}
                        >
                          {s.completed && <CheckCircle size={10} />}
                        </button>
                        <span className={cn("text-sm text-slate-600", s.completed && "line-through opacity-50")}>{s.title}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeSubtask(s.id)}
                        className="text-slate-400 hover:text-black transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 pt-4 flex gap-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold shadow-lg shadow-black/30 hover:bg-slate-800 transition-all"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
