import { Badge, BadgeProps } from '@mantine/core';

interface LocationBadgeProps extends Omit<BadgeProps, 'children' | 'color'> {
  value: 'in_storage' | 'in_transit';
}

export function LocationBadge({ value, variant = 'filled', ...props }: LocationBadgeProps) {
  return (
    <Badge color={value === 'in_storage' ? 'teal' : 'orange'} variant={variant} {...props}>
      {value === 'in_storage' ? 'In Storage' : 'In Transit'}
    </Badge>
  );
}
