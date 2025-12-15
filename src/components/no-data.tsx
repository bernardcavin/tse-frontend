import { Center, Paper, PaperProps } from '@mantine/core';
import DataState from '@/components/states';

interface NoDataProps extends Omit<PaperProps, 'children' | 'withBorder'> {
  text?: string;
  actions?: React.ReactNode;
  withBorder?: boolean;
}

export function NoData({ text, actions, withBorder = true, ...props }: NoDataProps) {
  return (
    <Paper {...props} h={props.h ?? 300} withBorder={withBorder}>
      <Center h="100%" my="md">
        <DataState type="no-data" title="Data not available" text={text} />
      </Center>
    </Paper>
  );
}
