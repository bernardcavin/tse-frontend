import { IconLogin } from '@tabler/icons-react';
import { zodResolver } from 'mantine-form-zod-resolver';
import { Button, Stack, StackProps } from '@mantine/core';
import { useForm } from '@mantine/form';
import { LoginRequestSchema } from '@/api/dtos';
import { FormProvider } from '@/components/forms/form-provider';
import { PasswordInput } from '@/components/forms/password-input';
import { TextInput } from '@/components/forms/text-input';
import { useAuth } from '@/hooks';
import { handleFormErrors } from '@/utilities/form';

interface LoginFormProps extends Omit<StackProps, 'children'> {
  onSuccess?: () => void;
}

export const transformBody = (body: Record<string, string>) => {
  const formBody = new URLSearchParams();

  for (const key in body) {
    formBody.append(key, body[key]);
  }
  return formBody.toString();
};

export function LoginForm({ onSuccess, ...props }: LoginFormProps) {
  const { login, isPendingLogin } = useAuth();

  const form = useForm({
    mode: 'controlled',
    validate: zodResolver(LoginRequestSchema),
    initialValues: { username: '', password: '' },
  });

  const handleSubmit = form.onSubmit((variables) => {
    try {
      login(variables.username, variables.password);
    } catch (error) {
      handleFormErrors(form, error);
    }
  });

  return (
    <FormProvider form={form} onSubmit={handleSubmit}>
      <Stack {...props}>
        <TextInput name="username" label="Username" required />
        <PasswordInput name="password" label="Password" required />
        {/* <Group justify="space-between">
          <Checkbox name="remember" label="Remember me" />
          <Anchor size="sm" component={NavLink} to={paths.auth.forgotPassword}>
            Forgot password?
          </Anchor>
        </Group> */}
        <Button
          type="submit"
          loading={isPendingLogin}
          mt="md"
          rightSection={<IconLogin stroke={1} />}
        >
          Login
        </Button>
      </Stack>
    </FormProvider>
  );
}
