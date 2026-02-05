import { modals } from '@mantine/modals';
import { CreateTaskForm, EditTaskForm } from './tasks-form';
import { ViewTaskForm } from './tasks-view';



export const openTaskCreate = (refetch: () => void) => {
  modals.open({
    title: 'Create Task',
    children: (
        <CreateTaskForm onSubmit={() => {
            refetch();
            modals.closeAll();
        }} />
    ),
    size: 'xl',
  });
};

export const openTaskEdit = (id: string, refetch: () => void) => {
  modals.open({
    title: 'Edit Task',
    children: (
        <EditTaskForm id={id} onSubmit={() => {
            refetch();
            modals.closeAll();
        }} />
    ),
    size: 'xl',
  });
};

export const openTaskView = (id: string) => {
  modals.open({
    title: 'View Task',
    children: <ViewTaskForm id={id} />,
    size: 'xl',
  });
};
