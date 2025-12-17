import {
    BsBoxFill,
    BsBuilding,
    BsBuildingFillGear,
    BsClock,
    BsExclamationCircle,
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
  alert: BsExclamationCircle,
};

export function DataIcon({ label }: { label: keyof typeof icons }) {
  return icons[label];
}
