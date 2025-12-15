import { PiMagnifyingGlassBold as SearchIcon } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { Spotlight, SpotlightActionData } from '@mantine/spotlight';
import { NavLink, SideLink } from '@/layouts/dashboard/sidebar/menu';

interface SearchMenuProps {
  menus: SideLink[];
}

export function SearchMenu({ menus }: SearchMenuProps) {
  const navigate = useNavigate();

  // helper to flatten menu tree -> SpotlightActionData[]
  const flattenMenus = (items: (SideLink | NavLink)[]): SpotlightActionData[] => {
    return items.flatMap((item) => {
      const action: SpotlightActionData = {
        id: item.title,
        label: item.title,
        description: item.description,
        onClick: () => navigate(item.href),
        leftSection: item.icon ? <item.icon size="1.25rem" /> : undefined,
      };

      if ('subs' in item && item.subs?.length) {
        return [action, ...flattenMenus(item.subs)];
      }

      return [action];
    });
  };

  const actions = flattenMenus(menus);

  return (
    <Spotlight
      scrollable
      highlightQuery
      maxHeight={500}
      actions={actions}
      nothingFound="Nothing found..."
      searchProps={{
        leftSection: <SearchIcon />,
        placeholder: 'Search feature',
      }}
    />
  );
}
