import { useGetTasks } from '@/hooks/api/tasks';
import { Paper, Select } from '@mantine/core';
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useMemo, useState } from 'react';
import { openTaskEdit } from './tasks-modals';

export function TasksGantt() {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  
  // Fetch all tasks for Gantt (ignoring pagination for now, or use large limit)
  const { data, isLoading } = useGetTasks();

  const tasks: Task[] = useMemo(() => {
    if (!data?.data) return [];
    
    return data.data.map((task) => {
        // Gantt needs valid start and end
        // If missing, default to now + 1 day for visualization or skip
        const start = task.start_date ? new Date(task.start_date) : new Date();
        const end = task.end_date ? new Date(task.end_date) : new Date(start.getTime() + 86400000);
        
        return {
            start,
            end,
            name: task.title,
            id: task.id,
            type: 'task',
            progress: task.status === 'COMPLETED' ? 100 : 0,
            isDisabled: false,
            styles: { progressColor: '#1c7ed6', progressSelectedColor: '#1971c2' },
        };
    });
  }, [data]);

  if (isLoading || tasks.length === 0) {
      return <Paper p="md">Loading or No Data...</Paper>;
  }

  return (
    <Paper p="md" withBorder>
        <Select
            label="View Mode"
            value={viewMode}
            onChange={(v) => setViewMode(v as ViewMode)}
            data={[
                { value: ViewMode.Day, label: 'Day' },
                { value: ViewMode.Week, label: 'Week' },
                { value: ViewMode.Month, label: 'Month' },
            ]}
            mb="md"
            maw={200}
        />
        <div style={{ overflowX: 'auto' }}>
            <Gantt
                tasks={tasks}
                viewMode={viewMode}
                onDoubleClick={(task) => openTaskEdit(task.id, () => {})}
                listCellWidth="155px"
                columnWidth={viewMode === ViewMode.Month ? 300 : 65}
            />
        </div>
    </Paper>
  );
}
