import { IconLogout, IconPower } from '@tabler/icons-react';
import { PiPower, PiPowerDuotone } from 'react-icons/pi';
import { ActionIcon, ActionIconProps, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useAuth } from '@/hooks';

interface LogoutButtonProps extends ActionIconProps {
  onLogout?: () => void;
}

export function LogoutButton({ onLogout, ...props }: LogoutButtonProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    modals.openConfirmModal({
      title: 'Are you sure you want to logout?',
      centered: true,
      labels: { confirm: 'Logout', cancel: 'Cancel' },
      size: 'xs',
      onConfirm: logout,
      onClose: () => onLogout?.(),
    });
  };

  return (
    <Tooltip label="Logout">
      <ActionIcon variant="filled" color="red" onClick={handleLogout} {...props} size="xl">
        <IconLogout size={20} stroke={2} />
      </ActionIcon>
    </Tooltip>
  );
}
