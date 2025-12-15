import {
  PiChatDuotone,
  PiGearSixDuotone,
  PiHeartDuotone,
  PiPauseDuotone,
  PiSignOut,
  PiStarDuotone,
  PiTrashDuotone,
  PiUserSwitchDuotone,
} from 'react-icons/pi';
import { Avatar, AvatarProps, ElementProps, Menu } from '@mantine/core';
import { useAuth, useLogout } from '@/hooks';

type CurrentUserProps = Omit<AvatarProps, 'src' | 'alt'> & ElementProps<'div', keyof AvatarProps>;

export function CurrentUser(props: CurrentUserProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Menu>
      <Menu.Target>
        <Avatar
          alt={user?.username ?? 'Current user'}
          {...props}
          style={{ cursor: 'pointer', ...props.style }}
        >
          CU
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<PiSignOut size="1rem" />} onClick={handleLogout}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
