import { notifications } from '@mantine/notifications';
import { Facility } from '@/api/entities/facility';
import {
  createDeleteMutationHook,
  createGetQueryHook,
  createPaginationQueryHook,
  createPostMutationHook,
  createPutMutationHook,
  SortableQueryParams,
} from '@/api/helpers';

export const useGetfacilities = createPaginationQueryHook<typeof Facility, SortableQueryParams>({
  endpoint: '/facilities',
  dataSchema: Facility,
  rQueryParams: { queryKey: ['facilities'] },
});

export const useGetFacility = createGetQueryHook({
  endpoint: '/facilities/:id',
  responseSchema: Facility,
  rQueryParams: { queryKey: ['facility'] },
});

export const useCreateFacility = createPostMutationHook({
  endpoint: '/facilities',
  bodySchema: Facility,

  rMutationParams: {
    onSuccess: (data) => {
      notifications.show({
        title: 'Berhasil',
        message: 'Facility berhasil dibuat',
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

export const useEditFacility = createPutMutationHook({
  endpoint: '/facilities/:id',
  bodySchema: Facility,

  rMutationParams: {
    onSuccess: (data) => {
      notifications.show({
        title: 'Berhasil',
        message: 'Facility berhasil diubah',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});

export const useDeleteFacility = createDeleteMutationHook({
  endpoint: '/facilities/:id',

  rMutationParams: {
    onSuccess: (data) => {
      notifications.show({
        title: 'Berhasil',
        message: 'Facility berhasil dihapus',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({ message: error.message, color: 'red' });
    },
  },
});
