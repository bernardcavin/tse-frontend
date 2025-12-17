import {
    BsBoxFill,
    BsBuilding,
    BsBuildingFillGear,
    BsClock,
    BsPeopleFill,
    BsTools
} from 'react-icons/bs';

export const icons = {
  inventory: BsTools,
  facilities: BsBuildingFillGear,
  dashboard: BsBoxFill,
  users: BsPeopleFill,
  clock: BsClock,
  building: BsBuilding,
};

export function DataIcon({ label }: { label: keyof typeof icons }) {
  return icons[label];
}
