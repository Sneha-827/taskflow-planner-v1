export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  deadline?: string; // ISO string
  notificationTime?: number; // Minutes before deadline
  notified?: boolean;
  completed: boolean;
  completedAt?: string; // ISO string
  subtasks: Subtask[];
  createdAt: string;
}

export interface AppSettings {
  fontFamily: string;
  viewTemplate: 'grid' | 'list';
}

export interface DashboardStats {
  total: number;
  completed: number;
  work: number;
  personal: number;
}
