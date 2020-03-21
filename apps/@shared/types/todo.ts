import * as yup from 'yup';
import { taskPayloadSchema } from '../schemas/yup/todos';

export type TaskPayload = yup.InferType<typeof taskPayloadSchema>;

export interface TaskRecord {
  id: string;
  description: string;
  owner_id: string;
  assignee_id: string | null;
  completed: boolean;
  created_at: string;
}

export interface TaskDocument {
  id: string;
  description: string;
  ownerId: string;
  assigneeId: string | null;
  completed: boolean;
  createdAt: string;
}
