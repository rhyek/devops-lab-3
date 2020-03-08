import React from 'react';
import { Field, FieldProps, FieldConfig } from 'formik';

interface RenderFunc<FV> {
  (
    props: FieldProps<any, FV> & {
      hasError: boolean;
      error?: FieldProps<any, FV>['form']['errors'][keyof FV];
    },
  ): React.ReactNode;
}

interface Props<FV> extends Omit<FieldConfig<FV>, 'name'> {
  name: keyof FV;
  children: RenderFunc<FV>;
}

export default function EasyField<FV>(props: Props<FV>) {
  const { name, children, validate } = props;
  return (
    <Field name={name} validate={validate}>
      {(props: FieldProps<{}, FV>) => {
        const hasError = props.form.submitCount > 0 && props.form.touched[name] && !!props.form.errors[name];
        return children({
          ...props,
          hasError,
          error: hasError && props.form.touched[name] ? props.form.errors[name] : undefined,
        });
      }}
    </Field>
  );
}
