import { removeClientAccessToken, setClientAccessToken } from '@/api/axios';
import { LoginRequestSchema, LoginResponseSchema } from '@/api/dtos';
import { createPostMutationHook } from '@/api/helpers';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';

export const useLogin = createPostMutationHook({
  endpoint: 'auth/login', // Updated endpoint
  bodySchema: LoginRequestSchema, // Body schema for request validation
  responseSchema: LoginResponseSchema, // Response schema for response validation
  rMutationParams: {
    onSuccess: (data) => {
      
      setClientAccessToken(data.access_token); // Set the access token
      console.log('Successfuly logged in')
      notifications.show({ title: 'Welcome back!', message: 'You have successfully logged in' });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
  options: {
    isMultipart: true,
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
