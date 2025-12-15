import {
  Menu,
  Button,
  Group,
  Text,
  TextInput,
  NumberInput,
  Select,
  Box,
  ActionIcon,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { CiSearch } from "react-icons/ci";


type HeaderColumnProps = {
  label: string;
  typeInput: 'string' | 'number' | 'select' | 'date';
  selectData? : string[];
  onFilterClick?: () => void;
};

export function HeaderColumn({ label, typeInput, selectData, onFilterClick }: HeaderColumnProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFilterClick?.();
  };

  const renderInput = () => {
    switch (typeInput) {
      case 'string':
        return <TextInput placeholder="Input value..." radius="xs" />;
      case 'number':
        return <NumberInput placeholder="Input number..." radius="xs" />;
      case 'select':
        return (
          <Select
            radius="xs"
            placeholder="Select value..."
            data={selectData}
          />
        );
      case 'date':
        return <DatePicker />;
      default:
        return null;
    }
  };

  return (
    <Group gap="xs" wrap="nowrap">
      <Text>{label}</Text>
      <Menu shadow="md">
        <Menu.Target>
        <ActionIcon variant="subtle" aria-label="Settings" onClick={handleClick}>
          <CiSearch size={16} />
        </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
          <Menu.Label>Input Filter</Menu.Label>
          <Box px="sm" py="xs">
            {renderInput()}
          </Box>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
