import * as yup from 'yup';

export const taskPayloadSchema = yup.object({
  id: yup.string().required(),
  description: yup
    .string()
    .label('Description')
    .required(),
  assigneeId: yup
    .string()
    .nullable(true)
    .transform((v, o) => (o === '' ? null : v)),
  completed: yup.boolean().required(),
});
