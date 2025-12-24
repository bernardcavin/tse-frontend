import { formatRegional } from '@/api/entities/contact';
import { FormSection } from '@/components/form-section';
import { useGetContact } from '@/hooks/api/contacts';
import { Grid, Loader, Stack, Text } from '@mantine/core';

interface ViewContactProps {
  id: string;
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Grid.Col span={{ base: 12, sm: 6 }}>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text size="md" fw={500}>
        {value || '-'}
      </Text>
    </Grid.Col>
  );
}

export function ViewContact({ id }: ViewContactProps) {
  const { data, isLoading } = useGetContact({ route: { id } });

  if (isLoading) {
    return <Loader color="blue" size="xl" />;
  }

  if (!data) {
    return <Text>Contact not found</Text>;
  }

  return (
    <Stack gap="md">
      {/* 🔹 Basic Information */}
      <FormSection title="Basic Information">
        <Grid>
          <DetailRow label="Nama" value={data.name} />
          <DetailRow label="Jabatan" value={data.position} />
          <DetailRow label="Email" value={data.email} />
          <DetailRow label="No. Hp" value={data.phone} />
        </Grid>
      </FormSection>

      {/* 🔹 Organization */}
      <FormSection title="Organization">
        <Grid>
          <DetailRow label="Perusahaan" value={data.company} />
          <DetailRow label="Regional" value={formatRegional(data.regional)} />
          <DetailRow label="Zona" value={data.zone} />
          <DetailRow label="Field" value={data.field} />
        </Grid>
      </FormSection>

      {/* 🔹 Additional Information */}
      <FormSection title="Additional Information">
        <Grid>
          <DetailRow label="Address" value={data.address} />
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">
              Notes
            </Text>
            <Text size="md" fw={500}>
              {data.notes || '-'}
            </Text>
          </Grid.Col>
        </Grid>
      </FormSection>
    </Stack>
  );
}
