import { UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export function handleFormErrors(form: UseFormReturnType<any>, errors: unknown) {
  if (!errors || typeof errors !== 'object') {
    return;
  }

  if ('formErrors' in errors && Array.isArray(errors.formErrors)) {
    errors.formErrors.forEach((error) => {
      notifications.show({ message: error, color: 'red' });
    });
  }

  if ('fieldErrors' in errors && typeof errors.fieldErrors === 'object' && errors.fieldErrors) {
    Object.entries(errors.fieldErrors).forEach(([name, fieldErrors]) => {
      form.setFieldError(name, fieldErrors.join(','));
    });
  }
}

export const getFieldValue = (fieldPath: string, form: UseFormReturnType<any>) => {
  try {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], form.getValues());
  } catch (error) {
    console.warn('Error getting field value:', error);
    return null;
  }
};

export const getFieldInitialValue = (fieldPath: string, form: UseFormReturnType<any>) => {
  try {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], form.getInitialValues());
  } catch (error) {
    console.warn('Error getting field initial value:', error);
    return null;
  }
};
