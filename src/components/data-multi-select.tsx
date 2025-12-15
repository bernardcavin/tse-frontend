import { forwardRef, useEffect, useState } from 'react';
import {
  Avatar,
  Group,
  Loader,
  MultiSelect as MantineMultiSelect,
  MultiSelectProps as MantineMultiSelectProps,
  Text,
} from '@mantine/core';
import { useForm } from '@/components/forms/form-provider';

export interface MultiSelectProps
  extends Omit<
    MantineMultiSelectProps,
    'checked' | 'value' | 'error' | 'onFocus' | 'onBlur' | 'onChange'
  > {
  name: string;
  dataGetter: () => Promise<Array<{ label: string; value: string }>>;
  onChange?: (value: string) => void;
  dependsOn?: any;
}

export const DataMultiSelect = forwardRef<HTMLInputElement, MultiSelectProps>(
  ({ name, dataGetter, onChange, dependsOn, ...props }, ref) => {
    const form = useForm();
    form.watch(name, ({ value }) => {
      onChange?.(value);
    });

    const [data, setData] = useState<Array<{ label: string; value: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setLoading(true);
      dataGetter().then((resp) => {
        setData(resp);
        setLoading(false);
      });
    }, [dependsOn]);

    return loading ? (
      <Loader size="xs" />
    ) : (
      <MantineMultiSelect
        data={data}
        ref={ref}
        key={form.key(name)}
        searchable
        comboboxProps={{ zIndex: 2001 }}
        rightSection={loading ? <Loader size="xs" /> : null}
        disabled={loading}
        {...props}
        {...form.getInputProps(name)}
      />
    );
  }
);
