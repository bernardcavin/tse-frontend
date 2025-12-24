import {
    BsBoxFill,
    BsBuilding,
    BsBuildingFillGear,
    BsClock,
    BsExclamationCircle,
    BsGear,
    BsPeopleFill,
    BsQrCode,
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
  qrCode: BsQrCode,
  settings: BsGear,
};

export function DataIcon({ label }: { label: keyof typeof icons }) {
  return icons[label];
}
