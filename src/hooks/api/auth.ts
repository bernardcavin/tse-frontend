import { removeClientAccessToken, setClientAccessToken } from '@/api/axios';
import { LoginRequestSchema, LoginResponseSchema } from '@/api/dtos';
import { createPostMutationHook } from '@/api/helpers';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

export const useLogin = createPostMutationHook({
  endpoint: 'auth/login',
  bodySchema: LoginRequestSchema,
  responseSchema: LoginResponseSchema,
  
  options: {
    contentType: 'application/x-www-form-urlencoded',
    skipAuth: true, // IMPORTANT: do not attach Authorization
    transformBody: (body) => {
    const params = new URLSearchParams();
    params.append('username', body.username);
    params.append('password', body.password);
    return params;
  },
  },
  rMutationParams: {
    onSuccess: (data) => {
      setClientAccessToken(data.access_token);
      notifications.show({
        title: 'Welcome back!',
        message: 'You have successfully logged in',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useLogout = createPostMutationHook({
  endpoint: 'auth/logout',
  bodySchema: z.null(),
  responseSchema: z.any(),
  rMutationParams: {
    onSuccess: () => {
      removeClientAccessToken();
      notifications.show({ title: 'Goodbye!', message: 'You have successfully logged out' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});
