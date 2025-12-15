import { forwardRef } from 'react';
import { Textarea as MantineTextarea, TextareaProps as MantineTextareaProps } from '@mantine/core';
import { useForm } from './form-provider';

export interface TextareaProps
  extends Omit<MantineTextareaProps, 'checked' | 'value' | 'error' | 'onFocus' | 'onBlur'> {
  name: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ name, ...props }, ref) => {
    const form = useForm();
    return (
      <MantineTextarea ref={ref} key={form.key(name)} {...props} {...form.getInputProps(name)} />
    );
  }
);
