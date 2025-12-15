import { forwardRef, ReactNode } from 'react';
import { CardSection, CardSectionProps, Group, Text, Title } from '@mantine/core';

export interface CardTitleProps extends Omit<CardSectionProps, 'size' | 'c' | 'fw' | 'tt'> {
  icon?: ReactNode;
  title: ReactNode;
  description?: string | ReactNode;
  actions?: ReactNode;
}

export const CardTitle = forwardRef<HTMLDivElement, CardTitleProps>(
  ({ title, description, style, actions, withBorder = true, icon, ...props }, ref) => (
    <CardSection
      ref={ref}
      py="md"
      withBorder={withBorder}
      inheritPadding
      style={{ ...style, borderTop: 'none' }}
      {...props}
    >
      <Group justify="space-between">
        <div>
          <Group>
            {icon}
            <Title order={5} fw={450}>
              {title}
            </Title>
          </Group>
          {description &&
            (typeof description === 'string' ? (
              <Text size="xs" c="dimmed">
                {description}
              </Text>
            ) : (
              description
            ))}
        </div>
        <div>{actions}</div>
      </Group>
    </CardSection>
  )
);
