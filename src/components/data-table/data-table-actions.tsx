import {
  PiTrashDuotone as DeleteIcon,
  PiPencilDuotone as EditIcon,
  PiGearDuotone,
  PiClockCounterClockwiseDuotone as RestoreIcon,
  PiEyeDuotone as ShowIcon,
} from 'react-icons/pi';
import { ActionIcon, Button, Group, GroupProps, Tooltip } from '@mantine/core';

export interface DataTableActionsProps extends GroupProps {
  onEdit?: (() => void) | null;
  onView?: (() => void) | null;
  onDelete?: (() => void) | null;
  onRestore?: (() => void) | null;
  onUpdate?: (() => void) | null;
}

export function DataTableActions({
  gap = 'xs',
  justify = 'left',
  wrap = 'nowrap',
  onEdit,
  onView,
  onDelete,
  onRestore,
  onUpdate,
  children,
  ...props
}: DataTableActionsProps) {
  return (
    <Group gap={gap} justify={justify} wrap={wrap} {...props}>
      {onView !== undefined && (
        <Tooltip label="Show">
          <ActionIcon
            variant="default"
            onClick={onView !== null ? onView : undefined}
            disabled={onView === null}
          >
            <ShowIcon size="1rem" />
          </ActionIcon>
        </Tooltip>
      )}
      {onEdit !== undefined && (
        <Tooltip label="Edit">
          <ActionIcon
            variant="default"
            onClick={onEdit !== null ? onEdit : undefined}
            disabled={onEdit === null}
          >
            <EditIcon size="1rem" />
          </ActionIcon>
        </Tooltip>
      )}
      {onUpdate !== undefined && (
        <Tooltip label="Update">
          <ActionIcon
            variant="default"
            onClick={onUpdate !== null ? onUpdate : undefined}
            disabled={onUpdate === null}
          >
            <PiGearDuotone size="1rem" />
          </ActionIcon>
        </Tooltip>
      )}
      {onDelete !== undefined && (
        <Tooltip label="Delete">
          <ActionIcon
            variant="outline"
            color="red"
            onClick={onDelete !== null ? onDelete : undefined}
            disabled={onDelete === null}
          >
            <DeleteIcon size="1rem" />
          </ActionIcon>
        </Tooltip>
      )}
      {onRestore !== undefined && (
        <Tooltip label="Restore">
          <ActionIcon
            variant="default"
            color="teal"
            onClick={onRestore !== null ? onRestore : undefined}
            disabled={onRestore === null}
          >
            <RestoreIcon size="1rem" />
          </ActionIcon>
        </Tooltip>
      )}
      {children}
    </Group>
  );
}
