import { UpdateProfile } from '@/api/entities/auth';
import { updateProfile } from '@/api/resources/auth';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ReturnType<typeof UpdateProfile.parse>) => updateProfile(data),
    onSuccess: () => {
      // Invalidate the current user query to refresh user data
      queryClient.invalidateQueries({ queryKey: ['account-info'] });
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile',
        color: 'red',
      });
    },
  });
}
