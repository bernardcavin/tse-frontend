import {
  BsBoxFill,
  BsBuilding,
  BsBuildingFillGear,
  BsClockFill,
  BsExclamationTriangleFill,
  BsGear,
  BsPeopleFill,
  BsPersonVcard,
  BsQrCode,
  BsTools
} from 'react-icons/bs';

export const icons = {
  inventory: BsTools,
  facilities: BsBuildingFillGear,
  dashboard: BsBoxFill,
  users: BsPeopleFill,
  clock: BsClockFill,
  building: BsBuilding,
  alert: BsExclamationTriangleFill,
  qrCode: BsQrCode,
  settings: BsGear,
  contacts: BsPersonVcard,
};

export function DataIcon({ label }: { label: keyof typeof icons }) {
  return icons[label];
}
