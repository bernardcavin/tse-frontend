import {
    BsBoxFill,
    BsBuilding,
    BsBuildingFillGear,
    BsClipboardCheck,
    BsClockFill,
    BsExclamationTriangleFill,
    BsFileText,
    BsGear,
    BsListCheck,
    BsPencil,
    BsPeopleFill,
    BsPerson,
    BsPersonVcard,
    BsQrCode,
    BsTicketDetailed,
    BsTools,
    BsTruck
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
  truck: BsTruck,
  fileText: BsFileText,
  clipboardCheck: BsClipboardCheck,
  pencil: BsPencil,
  tasks: BsListCheck,
};


export function DataIcon({ label }: { label: keyof typeof icons }) {
  return icons[label];
}
