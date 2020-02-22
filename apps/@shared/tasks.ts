export interface Task {
  id: string;
  description: string;
  owner: string;
  assignedTo: string | null;
}

export type NewTask = Omit<Task, 'id' | 'owner'>;
