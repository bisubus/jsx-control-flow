import { type FunctionComponent, isValidElement, type ReactElement, type ReactNode } from 'react';

import type { TFallback } from './types';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export interface IEmptyProps {
  children: TFallback;
}

export const Empty: FunctionComponent<IEmptyProps> = function Empty(_props) {
  return null;
};

type TEntryRenderFn = (value: unknown, key: string | number) => ReactNode;

interface IForIterableProps<T> {
  of: Iterable<T> | null | undefined;
  in?: never;
  empty?: TFallback;
  children: ((value: T, index: number) => ReactNode) | ReactNode;
}

interface IForObjectProps<T> {
  in: Record<string, T> | null | undefined;
  of?: never;
  empty?: TFallback;
  children: ((value: T, key: string) => ReactNode) | ReactNode;
}

type TForProps<T> = IForObjectProps<T> | IForIterableProps<T>;

type TFor = FunctionComponent<TForProps<unknown>> & { Empty: typeof Empty };

export const For: TFor = function For<T>(props: TForProps<T>) {
  const isObjectMode = hasOwnProperty.call(props, 'in');
  const hasOf = hasOwnProperty.call(props, 'of');

  if (isObjectMode && hasOf) {
    console.warn('Both "in" and "of" props provided; "if" will be used');
  }

  // Force use "in" value even if it's empty and "of" isn't
  const obj = (props as IForObjectProps<T>).in;
  const iterable = !isObjectMode ? (props as IForIterableProps<T>).of : undefined;
  const array: T[] | undefined = iterable
    ? Array.isArray(iterable)
      ? iterable
      : Array.from(iterable)
    : undefined;

  const fallbackProp = props.empty;
  const rawChildren = props.children;
  const rawChildrenArray: unknown[] = Array.isArray(rawChildren) ? rawChildren : [rawChildren];

  const renderChild = rawChildrenArray.find(
    (child): child is TEntryRenderFn => typeof child === 'function',
  );

  if (!renderChild) {
    console.warn('No render function provided');
    return null;
  }

  const fallbackSlot = rawChildrenArray.find(
    (child): child is ReactElement<IEmptyProps> => isValidElement(child) && child.type === Empty,
  );

  if (fallbackProp != null && fallbackSlot != null) {
    console.warn('Both "empty" prop and <Empty> provided; "empty" will be used');
  }

  const fallback: TFallback | undefined = fallbackProp ?? fallbackSlot?.props.children;

  const isEmpty = isObjectMode ? !obj || !Object.keys(obj).length : !array?.length;

  if (isEmpty) {
    const fallbackResult = typeof fallback === 'function' ? fallback() : fallback;
    return fallbackResult ?? null;
  } else if (isObjectMode) {
    return Object.entries(obj!).map(([key, value]) => renderChild(value, key));
  } else {
    return array!.map((entry, index) => renderChild(entry, index));
  }
};

For.Empty = Empty;
