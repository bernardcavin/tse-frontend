import { Page } from '@/components/page';
import { PageHeader } from '@/components/page-header';
import { paths } from '@/routes';
import { Tabs } from '@mantine/core';
import { IconCalendar, IconChartBar, IconList } from '@tabler/icons-react';
import { useState } from 'react';
import { TasksCalendar } from './tasks-calendar';
import { TasksGantt } from './tasks-gantt';
import { TasksTable } from './tasks-table';

const breadcrumbs = [{ label: 'Tasks', href: paths.manager.tasks }, { label: 'List'}];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<string | null>('list');

  return (
    <Page title="Tasks">
      <PageHeader title="Tasks Management" breadcrumbs={breadcrumbs} />

      <Tabs value={activeTab} onChange={setActiveTab} keepMounted={false}>
              <Tabs.List>
                  <Tabs.Tab value="list" leftSection={<IconList size={14} />}>
                      List
                  </Tabs.Tab>
                  <Tabs.Tab value="gantt" leftSection={<IconChartBar size={14} />}>
                      Gantt
                  </Tabs.Tab>
                  <Tabs.Tab value="calendar" leftSection={<IconCalendar size={14} />}>
                      Calendar
                  </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="list" pt="xs">
                  <TasksTable />
              </Tabs.Panel>

              <Tabs.Panel value="gantt" pt="xs">
                  <TasksGantt />
              </Tabs.Panel>

              <Tabs.Panel value="calendar" pt="xs">
                  <TasksCalendar />
              </Tabs.Panel>
          </Tabs>
    </Page>
  );
}
