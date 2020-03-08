export interface PersistedTask {
  id: string;
  description: string;
  ownerId: string;
  assigneeId: null | string;
  completed: boolean;
  createdAt: number;
}
