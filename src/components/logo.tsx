import { Group, GroupProps, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import LogoSigap from '/src/assets/logo-sigap.svg';

interface LogoProps extends Omit<GroupProps, 'children' | 'ref' | 'gap'> {
  variant?: 'default' | 'filled';
  withLabel?: boolean;
  size?: number;
}

export function Logo({ size = 40, variant = 'filled', withLabel = false, ...props }: LogoProps) {
  const { colorScheme } = useMantineColorScheme();
  return (
    <Tooltip label="SIGAP" position="bottom-start">
      <Group gap="md" wrap="nowrap" {...props}>
        {variant == 'default' ? (
          <>
            <img src={LogoSigap} alt="SIGAP Logo" width={size} height={size} />
            {withLabel ? (
              <Text fw={700} fz="lg" c="white">
                SIGAP
              </Text>
            ) : null}
          </>
        ) : variant == 'filled' ? (
          <>
            <img
              src={LogoSigap}
              alt="SIGAP Logo"
              width={size}
              height={size}
              style={{
                backgroundColor: `var(--mantine-color-blue-6)`,
                borderRadius: '20%',
                padding: '15px',
              }}
            />
            {withLabel ? (
              <Text fw={700} fz="lg" c={colorScheme == 'dark' ? 'white' : 'blue.9'}>
                SIGAP
              </Text>
            ) : null}
          </>
        ) : null}
      </Group>
    </Tooltip>
  );
}
