import { forwardRef, useState } from 'react';
import {
  Anchor,
  Collapse,
  Fieldset,
  FieldsetProps,
  Checkbox as MantineCheckbox,
  CheckboxProps as MantineCheckboxProps,
  Stack,
  Text,
  Title,
} from '@mantine/core';

export interface FormSectionProps extends FieldsetProps {
  id?: string;
  title?: string;
  withHide?: boolean;
  defaultHidden?: boolean;
}

export const FormSection = forwardRef<HTMLInputElement, FormSectionProps>(
  ({ id, title, children, withHide, defaultHidden = false, ...props }, ref) => {
    const [isHidden, setIsHidden] = useState(defaultHidden);

    return withHide ? (
      <Fieldset id={id} legend={<Text fw={600}>{title}</Text>} {...props}>
        <Stack gap={isHidden ? 0 : 'xs'}>
          <Collapse in={!isHidden}>
            <Stack gap="md">{children}</Stack>
          </Collapse>
          <Anchor size="xs" onClick={() => setIsHidden(!isHidden)}>
            {isHidden ? 'Show' : 'Hide'}
          </Anchor>
        </Stack>
      </Fieldset>
    ) : (
      <Fieldset id={id} legend={<Text fw={600}>{title}</Text>} {...props}>
        <Stack gap="md">{children}</Stack>
      </Fieldset>
    );
  }
);
