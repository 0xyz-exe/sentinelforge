import { randomBytes } from 'crypto';

export function cuid() {
  return randomBytes(16).toString('hex');
}

export function timestamp() {
  return Date.now();
}
