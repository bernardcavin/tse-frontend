import { useAuth } from '@/hooks';
import { paths } from '@/routes/paths';
import { Avatar, AvatarProps, ElementProps, Menu } from '@mantine/core';
import { PiSignOut, PiUser } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';

type CurrentUserProps = Omit<AvatarProps, 'src' | 'alt'> & ElementProps<'div', keyof AvatarProps>;

export function CurrentUser(props: CurrentUserProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleProfile = () => {
    const profilePath = user?.role === 'MANAGER' ? paths.manager.profile : paths.employee.profile;
    navigate(profilePath);
  };

  return (
    <Menu shadow="md" width={250}>
      <Menu.Target>
        <Avatar
          alt={user?.username ?? 'Current user'}
          {...props}
          style={{ cursor: 'pointer', ...props.style }}
          color="blue"
          variant="filled"
        >
          <PiUser size="1.5rem" />
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.75rem', color: 'gray' }}>{user?.email || user?.username}</div>
          </div>
        </Menu.Label>
        <Menu.Divider />
        <Menu.Item leftSection={<PiUser size="1rem" />} onClick={handleProfile}>
          Profile
        </Menu.Item>
        <Menu.Item leftSection={<PiSignOut size="1rem" />} onClick={handleLogout} color="red">
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
