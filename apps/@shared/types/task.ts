import * as yup from 'yup';
import { taskPayloadSchema } from '../schemas/yup/tasks';

export type TaskPayload = yup.InferType<typeof taskPayloadSchema>;

export interface TaskRecord {
  id: string;
  description: string;
  owner_id: string;
  assignee_id: string | null;
  completed: boolean;
  created_at: string;
}
