import { UpdateProfile } from '@/api/entities/auth';
import { FormSection } from '@/components/form-section';
import { useAuth } from '@/hooks';
import { useUpdateProfile } from '@/hooks/api/profile';
import { emptyStringToNull } from '@/utilities/object';
import { Button, Grid, Group, PasswordInput, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import z from 'zod';

export function ProfileForm() {
  const { user } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<z.infer<typeof UpdateProfile>>({
    validate: zodResolver(UpdateProfile),
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        username: user.username,
        name: user.name,
        nik: user.nik,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        emergency_contact_name: user.emergency_contact_name,
        emergency_contact_phone: user.emergency_contact_phone,
        password: '', // Don't pre-fill password for security
      });
    }
  }, [user]);

  const handleSubmit = form.onSubmit((values: any) => {
    // Only send fields that have been changed
    const updates: any = {};
    
    if (values.username !== user?.username) updates.username = values.username;
    if (values.name !== user?.name) updates.name = values.name;
    if (values.nik !== user?.nik) updates.nik = values.nik;
    if (values.email !== user?.email) updates.email = values.email;
    if (values.phone_number !== user?.phone_number) updates.phone_number = values.phone_number;
    if (values.address !== user?.address) updates.address = values.address;
    if (values.emergency_contact_name !== user?.emergency_contact_name) 
      updates.emergency_contact_name = values.emergency_contact_name;
    if (values.emergency_contact_phone !== user?.emergency_contact_phone) 
      updates.emergency_contact_phone = values.emergency_contact_phone;
    if (values.password && values.password.trim() !== '') 
      updates.password = values.password;

    updateProfile(emptyStringToNull(updates), {
      onSuccess: () => {
        form.setFieldValue('password', ''); // Clear password field after successful update
      },
    });
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {/* Account Information */}
        <FormSection title="Account Information">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Username"
                placeholder="e.g. johndoe"
                description="Your login username"
                {...form.getInputProps('username')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <PasswordInput
                label="New Password"
                placeholder="Leave blank to keep current password"
                description="Only enter if you want to change your password"
                {...form.getInputProps('password')}
              />
            </Grid.Col>
          </Grid>
        </FormSection>

        {/* Personal Information */}
        <FormSection title="Personal Information">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Full Name"
                placeholder="e.g. John Doe"
                description="Your full name"
                {...form.getInputProps('name')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="NIK (National ID)"
                placeholder="e.g. 1234567890123456"
                description="Indonesian National ID number"
                {...form.getInputProps('nik')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Email Address"
                placeholder="e.g. john.doe@company.com"
                type="email"
                description="Your email address"
                {...form.getInputProps('email')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Phone Number"
                placeholder="e.g. +62 812-3456-7890"
                type="tel"
                description="Your mobile or work phone"
                {...form.getInputProps('phone_number')}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Address"
                placeholder="Enter your full address"
                description="Your residential address"
                minRows={2}
                {...form.getInputProps('address')}
              />
            </Grid.Col>
          </Grid>
        </FormSection>

        {/* Emergency Contact */}
        <FormSection title="Emergency Contact">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Emergency Contact Name"
                placeholder="e.g. Jane Doe (Spouse)"
                description="Name of person to contact in emergency"
                {...form.getInputProps('emergency_contact_name')}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Emergency Contact Phone"
                placeholder="e.g. +62 812-9876-5432"
                type="tel"
                description="Emergency contact's phone number"
                {...form.getInputProps('emergency_contact_phone')}
              />
            </Grid.Col>
          </Grid>
        </FormSection>

        <Group justify="flex-end" mt="md">
          <Button type="submit" loading={isPending}>
            Update Profile
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
