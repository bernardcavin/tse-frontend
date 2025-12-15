import { Box1, Building, Drop, Flashy, Map1, Note, Setting, Setting2 } from 'iconsax-react';
import {
  BsBellFill,
  BsBox,
  BsBoxFill,
  BsBuilding,
  BsBuildingFillGear,
  BsEnvelopeFill,
  BsGearFill,
  BsPersonFill,
  BsRulers,
  BsTable,
  BsTools,
} from 'react-icons/bs';
import {
  GiAngola,
  GiAnticlockwiseRotation,
  GiBoxTrap,
  GiBriefcase,
  GiCalendar,
  GiCompass,
  GiDatabase,
  GiHand,
  GiHouse,
  GiMongolia,
  GiNotebook,
  GiOffshorePlatform,
  GiOilPump,
  GiOilRig,
  GiPerson,
  GiPlainSquare,
  GiPostOffice,
  GiStack,
  GiToolbox,
} from 'react-icons/gi';

export const icons = {
  inventory: BsTools,
  facilities: BsBuildingFillGear,
  dashboard: BsBoxFill,
};

export function DataIcon({ label }: { label: keyof typeof icons }) {
  return icons[label];
}
