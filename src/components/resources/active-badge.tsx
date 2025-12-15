import { Badge, BadgeProps } from '@mantine/core';

interface ActiveBadgeProps extends Omit<BadgeProps, 'children' | 'color'> {
  active: boolean;
}

export function ActiveBadge({ active, variant = 'filled', ...props }: ActiveBadgeProps) {
  return (
    <Badge color={active ? 'teal' : 'orange'} variant={variant} {...props}>
      {active ? 'Active' : 'Inactive'}
    </Badge>
  );
}
