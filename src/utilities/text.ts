import { MantineColorScheme } from "@mantine/core";
import { match } from "./match";

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function titlize(str: string) {
  return str
    .toLowerCase()
    .split(/[\s-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function firstLetters(text: string) {
  return text
    .split(' ')
    .map((word) => word[0])
    .join('');
}

export const formatString = (str: string) => {
  return str
    .split('_')  // Split at underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize each word
    .join(' ');  // Join back with spaces
};

export const formatProjectType = (projectType: string) => {
  return match<string>(
      [projectType === 'exploration', 'Exploration'],
      [projectType === 'development', 'Development'],
      [projectType === 'workover', 'Workover'],
      [projectType === 'wellservice', 'Well Service'],

      [projectType === 'EXPLORATION', 'Exploration'],
      [projectType === 'DEVELOPMENT', 'Development'],
      [projectType === 'WORKOVER', 'Workover'],
      [projectType === 'WELLSERVICE', 'Well Service'],
      
      [true, 'Exploration']
    );
};
