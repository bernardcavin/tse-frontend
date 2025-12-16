import {
    BsBoxFill,
    BsBuildingFillGear,
    BsPeopleFill,
    BsTools
} from 'react-icons/bs';

export const icons = {
  inventory: BsTools,
  facilities: BsBuildingFillGear,
  dashboard: BsBoxFill,
  users: BsPeopleFill,
};

export function DataIcon({ label }: { label: keyof typeof icons }) {
  return icons[label];
}
