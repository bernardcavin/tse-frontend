import { useGetTasks } from '@/hooks/api/tasks';
import { Box, Loader, Paper, Text, useMantineTheme } from '@mantine/core';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Calendar, dayjsLocalizer, View, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { openTaskView } from './tasks-modals';

// Setup the localizer for react-big-calendar
const localizer = dayjsLocalizer(dayjs);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any; // Original task object
  status: string;
}

export function TasksCalendar() {
  const theme = useMantineTheme();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Fetch all tasks for now (limit 100 or more)
  const { data, isLoading } = useGetTasks({ query: { limit: 200 } });

  const events: CalendarEvent[] = useMemo(() => {
    if (!data?.data) return [];

    return data.data
      .filter((task) => task.start_date && task.end_date)
      .map((task) => ({
        id: task.id,
        title: task.title,
        start: new Date(task.start_date!),
        end: new Date(task.end_date!),
        resource: task,
        status: task.status,
      }));
  }, [data]);

  const eventPropGetter = (event: CalendarEvent) => {
    let backgroundColor = theme.colors.blue[6];
    
    switch (event.status) {
      case 'PLANNED': backgroundColor = theme.colors.blue[6]; break;
      case 'IN_PROGRESS': backgroundColor = theme.colors.yellow[6]; break;
      case 'COMPLETED': backgroundColor = theme.colors.green[6]; break;
      case 'CANCELLED': backgroundColor = theme.colors.gray[6]; break;
      case 'ON_HOLD': backgroundColor = theme.colors.orange[6]; break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    openTaskView(event.id);
  };

  if (isLoading) {
    return (
        <Box h={600} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader />
        </Box>
    );
  }

  return (
    <Paper p="md" withBorder style={{ height: 700 }}>
      {/* Custom styles to override some ugly defaults if needed, or stick to standard */}
      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-toolbar button { color: inherit; }
        .rbc-toolbar button.rbc-active { background-color: ${theme.colors.blue[0]}; color: ${theme.colors.blue[7]}; font-weight: bold; }
        .rbc-event { padding: 2px 5px; }
      `}</style>
      
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        eventPropGetter={eventPropGetter}
        onSelectEvent={handleSelectEvent}
        popup
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        components={{
            event: ({ event }) => (
                <div title={event.title}>
                    <Text size="xs" truncate fw={500}>{event.title}</Text>
                </div>
            )
        }}
      />
    </Paper>
  );
}
