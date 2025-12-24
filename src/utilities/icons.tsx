import {
    BsBoxFill,
    BsBuilding,
    BsBuildingFillGear,
    BsClockFill,
    BsExclamationTriangleFill,
    BsGear,
    BsPeopleFill,
    BsPerson,
    BsPersonVcard,
    BsQrCode,
    BsTicketDetailed,
    BsTools
} from 'react-icons/bs';

export const icons = {
  inventory: BsTools,
  facilities: BsBuildingFillGear,
  dashboard: BsBoxFill,
  users: BsPeopleFill,
  user: BsPerson,
  clock: BsClockFill,
  building: BsBuilding,
  alert: BsExclamationTriangleFill,
  qrCode: BsQrCode,
  settings: BsGear,
  contacts: BsPersonVcard,
  ticket: BsTicketDetailed,
};

export function DataIcon({ label }: { label: keyof typeof icons }) {
  return icons[label];
}
