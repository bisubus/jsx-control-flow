type TFunction = (...args: unknown[]) => unknown;

export const isFunction = (value: unknown): value is TFunction => typeof value === 'function';

export const hasOwnProperty = Object.prototype.hasOwnProperty;
