import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Settings as SettingsIcon, 
  Plus, 
  Bell, 
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, AppSettings, DashboardStats } from './types';
import { cn, formatTime } from './lib/utils';

// --- Components ---
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';

export default function App() {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('taskflow_settings');
    return saved ? JSON.parse(saved) : { fontFamily: 'font-inter', viewTemplate: 'grid' };
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'settings'>('dashboard');
  const [filter, setFilter] = useState<'all' | 'work' | 'personal'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialDate, setInitialDate] = useState<Date | undefined>(undefined);
  const [notifications, setNotifications] = useState<{ id: string; message: string; time: string }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('taskflow_settings', JSON.stringify(settings));
  }, [settings]);

  // --- Handlers ---
  const addNotification = useCallback((message: string) => {
    const newNotif = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      time: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 5));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const addTask = useCallback((taskData: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title || 'Untitled Task',
        description: taskData.description || '',
        category: taskData.category || 'personal',
        priority: taskData.priority || 'medium',
        deadline: taskData.deadline,
        notificationTime: taskData.notificationTime || 60,
        completed: false,
        subtasks: taskData.subtasks || [],
        createdAt: new Date().toISOString(),
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setIsModalOpen(false);
    setInitialDate(undefined);
  }, [editingTask, updateTask, addNotification]);

  // --- Notification Checker ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.deadline && !task.completed && !task.notified) {
          const deadlineDate = new Date(task.deadline);
          const notifyBeforeMs = (task.notificationTime || 60) * 60 * 1000;
          const notificationTime = new Date(deadlineDate.getTime() - notifyBeforeMs);

          if (now >= notificationTime && now < deadlineDate) {
            addNotification(`Upcoming deadline: ${task.title} is due at ${formatTime(task.deadline)}`);
            updateTask(task.id, { notified: true });
          }
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [tasks, addNotification, updateTask]);

  const stats = useMemo((): DashboardStats => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const work = tasks.filter(t => t.category === 'work').length;
    const personal = tasks.filter(t => t.category === 'personal').length;
    return { total, completed, work, personal };
  }, [tasks]);

  // --- Main Render ---
  return (
    <div className={cn("min-h-screen flex text-slate-900 bg-white transition-colors duration-300", settings.fontFamily)}>
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-6 fixed h-full z-20 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/30">
            <CheckCircle size={24} />
          </div>
          <span className="hidden md:block font-display font-bold text-xl tracking-tight text-slate-900">TaskFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
            { id: 'settings', icon: SettingsIcon, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                activeTab === item.id 
                  ? "bg-black text-white shadow-lg shadow-black/20" 
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon size={22} className={cn(activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="hidden md:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 hidden md:block">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Progress</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">{Math.round((stats.completed / stats.total) * 100 || 0)}%</span>
              <span className="text-xs text-slate-500">{stats.completed}/{stats.total} Tasks</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-black h-full transition-all duration-1000" 
                style={{ width: `${(stats.completed / stats.total) * 100 || 0}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-10 lg:p-16 pb-32 md:pb-10">
        <div className="max-w-6xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-8 md:mb-10 gap-4">
            <div className="md:hidden">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">TaskFlow</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-12 h-12 md:w-11 md:h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors relative"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute top-3 right-3 w-2 h-2 bg-black rounded-full border-2 border-white" />
                  )}
                </button>
                
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-[calc(100vw-2rem)] md:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900">Notifications</h4>
                        <button onClick={() => setNotifications([])} className="text-xs text-black hover:underline">Clear all</button>
                      </div>
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-slate-400 py-8 text-sm">No new notifications</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="flex gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-black shrink-0">
                                <Bell size={14} />
                              </div>
                              <div>
                                <p className="text-sm text-slate-700 leading-tight">{n.message}</p>
                                <span className="text-[10px] text-slate-400">{formatTime(n.time)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <button 
                onClick={() => { setEditingTask(null); setInitialDate(undefined); setIsModalOpen(true); }}
                className="hidden md:flex px-6 py-2.5 bg-black text-white rounded-xl font-semibold shadow-lg shadow-black/30 hover:bg-slate-800 hover:-translate-y-0.5 transition-all items-center gap-2"
              >
                <Plus size={20} />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  tasks={tasks}
                  stats={stats}
                  filter={filter}
                  setFilter={setFilter}
                  viewTemplate={settings.viewTemplate}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onEdit={(task) => { setEditingTask(task); setInitialDate(undefined); setIsModalOpen(true); }}
                  onAddNew={() => { setEditingTask(null); setInitialDate(undefined); setIsModalOpen(true); }}
                />
              )}
              {activeTab === 'calendar' && (
                <CalendarView 
                  tasks={tasks} 
                  onEditTask={(task) => { setEditingTask(task); setInitialDate(undefined); setIsModalOpen(true); }}
                  onAddTask={(date) => { setEditingTask(null); setInitialDate(date); setIsModalOpen(true); }}
                />
              )}
              {activeTab === 'settings' && <SettingsView settings={settings} setSettings={setSettings} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-40 pb-safe">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
          { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
          { id: 'settings', icon: SettingsIcon, label: 'Settings' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              activeTab === item.id ? "text-black" : "text-slate-400"
            )}
          >
            <item.icon size={24} className={cn(activeTab === item.id ? "text-black" : "text-slate-400")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        
        <button 
          onClick={() => { setEditingTask(null); setInitialDate(undefined); setIsModalOpen(true); }}
          className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 -translate-y-6 border-4 border-white"
        >
          <Plus size={28} />
        </button>
      </nav>

      {/* Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <TaskModal 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); setEditingTask(null); setInitialDate(undefined); }} 
            onSave={addTask} 
            editingTask={editingTask}
            initialDate={initialDate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
