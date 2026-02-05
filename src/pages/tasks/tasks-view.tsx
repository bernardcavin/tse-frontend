import { FileDownloadButton } from '@/components/file-download';
import { FormSection } from '@/components/form-section';
import { useGetTask } from '@/hooks/api/tasks';
import { formatDateReadable } from '@/utilities/date';
import {
    Badge,
    Divider,
    Grid,
    Group,
    Loader,
    Stack,
    Table,
    Text,
} from '@mantine/core';

interface ViewTaskFormProps {
  id: string;
}

export function ViewTaskForm({ id }: ViewTaskFormProps) {
  const { data: task, isLoading } = useGetTask({ route: { id } });

  if (isLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="lg" />
      </Group>
    );
  }

  if (!task) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No task data found.
      </Text>
    );
  }

  return (
    <Stack gap="lg">
      <FormSection title="Basic Information" withHide>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field label="Task Title" value={task.title} />
            <Field 
              label="Status" 
              value={<Badge color={getStatusColor(task.status)}>{task.status}</Badge>} 
            />
            <Field 
              label="Priority" 
              value={<Badge variant="outline" color={getPriorityColor(task.priority)}>{task.priority}</Badge>} 
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Field 
                label="Start Date" 
                value={task.start_date ? formatDateReadable(new Date(task.start_date)) : '-'} 
            />
            <Field 
                label="End Date" 
                value={task.end_date ? formatDateReadable(new Date(task.end_date)) : '-'} 
            />
             <Field 
                label="Start Time" 
                value={task.time_start} 
            />
             <Field 
                label="End Time" 
                value={task.time_end} 
            />
          </Grid.Col>
           <Grid.Col span={12}>
            <Field label="Description" value={task.description} />
          </Grid.Col>
        </Grid>
      </FormSection>

      <FormSection title="Assignments" withHide>
        <Grid>
             <Grid.Col span={12}>
                 <Field 
                    label="Assignees" 
                    value={
                        task.assignee_ids?.length 
                        ? task.assignee_ids.length + ' Assignee(s)' // Ideally fetching user names would be better, but IDs are what we have on the object directly for now. 
                        // If the backend returned populated objects that would be better. For now let's stick to what we have.
                        : 'No assignees'
                    } 
                 />
                 {/*  
                    TODO: Fetch and display actual user names if available or if we fetch them. 
                    Currently the hook might just return IDs depending on backend implementation.
                    Checking task object structure... 
                    If task object has `assignees` relationship loaded it would be better.
                  */}
             </Grid.Col>
        </Grid>
      </FormSection>

      {task.attachment_file_ids && task.attachment_file_ids.length > 0 && (
        <FormSection title="Attachments" withHide>
          <Table>
            <Table.Tbody>
              {task.attachment_file_ids.map((file_id) => (
                <Table.Tr key={file_id}>
                  <Table.Td>
                    <FileDownloadButton file_id={file_id} withFileInfo />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </FormSection>
      )}
    </Stack>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | number | null | React.ReactNode;
}) {
  return (
    <Stack gap={2} mb="sm">
      <Text c="dimmed" fz="sm">
        {label}
      </Text>
      <Text fw={500} style={{ wordBreak: 'break-word' }}>
        {value ?? '-'}
      </Text>
      <Divider my={4} />
    </Stack>
  );
}

const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'blue';
      case 'IN_PROGRESS': return 'yellow';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'gray';
      case 'ON_HOLD': return 'orange';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
     switch (priority) {
      case 'CRITICAL': return 'red';
      case 'HIGH': return 'orange';
      case 'MEDIUM': return 'blue';
      case 'LOW': return 'gray';
      default: return 'gray';
    }
  };
