import {
    TimeInput as MantineTimeInput,
    TimeInputProps as MantineTimeInputProps,
} from '@mantine/dates';
import { forwardRef } from 'react';
import { useForm } from './form-provider';

export interface TimeInputProps
  extends Omit<MantineTimeInputProps, 'checked' | 'value' | 'error' | 'onFocus' | 'onBlur'> {
  name: string;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ name, ...props }, ref) => {
    const form = useForm();
    return <MantineTimeInput ref={ref} {...props} {...form.getInputProps(name)} />;
  }
);
