import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { Button, Group, Image, ImageProps, Loader, Stack, StackProps, Text } from '@mantine/core';
import NoAsset from '@/assets/states/no-asset.svg';
import NoAttendance from '@/assets/states/no-attendance.svg';
import NoDashboard from '@/assets/states/no-dashboard.svg';
import NoData from '@/assets/states/no-data.svg';
import NoMap from '@/assets/states/no-map.svg';
import NoNotification from '@/assets/states/no-notification.svg';
import NoPerson from '@/assets/states/no-person.svg';
import NoProject from '@/assets/states/no-project.svg';
import NoTask from '@/assets/states/no-task.svg';

const svgMap = {
  'no-data': NoData,
  'no-notification': NoNotification,
  'no-project': NoProject,
  'no-asset': NoAsset,
  'no-task': NoTask,
  'no-person': NoPerson,
  'no-map': NoMap,
  'no-active-session': NoAttendance,
  'no-dashboard': NoDashboard,
};

interface DataStateProps extends Omit<StackProps, 'children' | 'align' | 'justify' | 'gap'> {
  type: keyof typeof svgMap | 'loading';
  title?: string;
  text?: string;
  refresh?: () => void;
  addNew?: () => void;
  createNew?: () => void;
  imageProps?: Omit<ImageProps, 'src'>;
}

export default function DataState({
  type,
  title = 'No Data',
  text = 'No data currently available. Please try again later.',
  imageProps,
  refresh,
  addNew,
  createNew,
  ...props
}: DataStateProps) {
  return (
    <Stack align="center" justify="center" gap={30} {...props}>
      {type === 'loading' ? (
        <Loader color="blue" size="xl" />
      ) : (
        <Image src={svgMap[type]} w="20%" {...imageProps} />
      )}
      <Stack align="center" justify="center" gap={10}>
        <Text size="xl" fw={9000}>
          {type === 'loading' ? 'Loading' : title}
        </Text>
        <Text size="md" fw={400} c="dimmed" ta="center">
          {type === 'loading' ? 'Data is loading, please wait.' : text}
        </Text>
      </Stack>
      <Group>
        {refresh && (
          <Button
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            onClick={refresh}
            leftSection={<IconRefresh size={20} />}
            size="lg"
          >
            Refresh
          </Button>
        )}
        {addNew && (
          <Button variant="default" onClick={addNew} size="lg" leftSection={<IconPlus size={20} />}>
            Add New
          </Button>
        )}
        {createNew && (
          <Button
            variant="default"
            onClick={createNew}
            size="lg"
            leftSection={<IconPlus size={20} />}
          >
            Create New
          </Button>
        )}
      </Group>
    </Stack>
  );
}
