import { Contact } from '@/api/entities/contact';
import {
    createDeleteMutationHook,
    createGetQueryHook,
    createPaginationQueryHook,
    createPostMutationHook,
    createPutMutationHook,
} from '@/api/helpers';
import { getZoneOptions } from '@/api/resources/contacts';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';

type FilterableQueryParams = {
  sort?: `${string}:${'asc' | 'desc'}`;
  filter?: string;
};

export const useGetContacts = createPaginationQueryHook<typeof Contact, FilterableQueryParams>({
  endpoint: '/contacts',
  dataSchema: Contact,
  rQueryParams: { queryKey: ['contacts'] },
});

export const useGetContact = createGetQueryHook({
  endpoint: '/contacts/:id',
  responseSchema: Contact,
  rQueryParams: { queryKey: ['contact'] },
});

export const useCreateContact = createPostMutationHook({
  endpoint: '/contacts',
  bodySchema: Contact,
  rMutationParams: {
    onSuccess: (_data, _variables, _context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      notifications.show({
        title: 'Berhasil',
        message: 'Kontak berhasil dibuat',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
  options: {
    isMultipart: false,
  },
});

export const useEditContact = createPutMutationHook({
  endpoint: '/contacts/:id',
  bodySchema: Contact,
  rMutationParams: {
    onSuccess: (_data, _variables, _context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact'] });
      notifications.show({
        title: 'Berhasil',
        message: 'Kontak berhasil diubah',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useDeleteContact = createDeleteMutationHook({
  endpoint: '/contacts/:id',
  rMutationParams: {
    onSuccess: (_data, _variables, _context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      notifications.show({
        title: 'Berhasil',
        message: 'Kontak berhasil dihapus',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useGetZoneOptions = () => {
  return useQuery({
    queryKey: ['zone-options'],
    queryFn: getZoneOptions,
  });
};

export const useBulkImportContacts = createPostMutationHook({
  endpoint: '/contacts/bulk',
  bodySchema: Contact.array(),
  rMutationParams: {
    onSuccess: (data: any, _variables, _context, queryClient) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['zone-options'] });
      notifications.show({
        title: 'Berhasil',
        message: `${data?.data?.created || 0} kontak berhasil diimport`,
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
  options: {
    isMultipart: false,
  },
});
