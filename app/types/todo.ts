export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  location?: string;
  people?: string[];
} 