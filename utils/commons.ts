import { v4 as uuidv4 } from 'uuid';

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getUuid(): string {
  return uuidv4();
}