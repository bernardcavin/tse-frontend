import { forwardRef } from 'react';
import {
  DateTimePicker as MantineDateTimePicker,
  DateTimePickerProps as MantineDateTimePickerProps,
} from '@mantine/dates';
import { useForm } from './form-provider';

export interface DateTimePickerProps
  extends Omit<MantineDateTimePickerProps, 'checked' | 'value' | 'error' | 'onFocus' | 'onBlur'> {
  name: string;
}

export const DateTimePicker = forwardRef<HTMLButtonElement, DateTimePickerProps>(
  ({ name, ...props }, ref) => {
    const form = useForm();
    return <MantineDateTimePicker ref={ref} {...props} {...form.getInputProps(name)} />;
  }
);
