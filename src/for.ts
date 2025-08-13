import { type FunctionComponent, isValidElement, type ReactElement, type ReactNode } from 'react';

import { isFunction } from '@/utils';

import type { TFallback } from './types';

export interface IEmptyProps {
  children: TFallback;
}
export const Empty = function Empty(_props: IEmptyProps) {
  return null;
} satisfies FunctionComponent<IEmptyProps>;

type TEmpty = typeof Empty;

type TForIterableChildRenderFn<T> = (value: T, index: number) => ReactNode;
type TForIterableValue<T> = Iterable<T> | null | undefined;
type TForIterableValueGetter<T> = () => TForIterableValue<T>;

type TForObjectChildRenderFn<T> = (value: T, key: string) => ReactNode;
type TForObjectValue<T> = Record<string, T> | null | undefined;
type TForObjectValueGetter<T> = () => TForObjectValue<T>;

type TForChildRenderFn<T> = (value: T, key: number | string) => ReactNode;

interface IForIterableWithEmptyProp<T> {
  in?: never;
  of: TForIterableValueGetter<T> | TForIterableValue<T>;
  empty?: TFallback;
  children: TForIterableChildRenderFn<T>;
}

interface IForIterableWithEmptySlot<T> {
  in?: never;
  of: TForIterableValueGetter<T> | TForIterableValue<T>;
  empty?: never;
  children: [TForObjectChildRenderFn<T>, ReactElement<IEmptyProps>];
}

type IForIterableProps<T> = IForIterableWithEmptyProp<T> | IForIterableWithEmptySlot<T>;

interface IForObjectWithEmptyProp<T> {
  in: TForObjectValueGetter<T> | TForObjectValue<T>;
  of?: never;
  empty?: TFallback;
  children: (value: T, key: string) => ReactNode;
}

interface IForObjectWithEmptySlot<T> {
  in: TForObjectValueGetter<T> | TForObjectValue<T>;
  of?: never;
  empty?: never;
  children: [(value: T, key: string) => ReactNode, ReactElement<IEmptyProps>];
}

type IForObjectProps<T> = IForObjectWithEmptyProp<T> | IForObjectWithEmptySlot<T>;

type TForProps<T> = IForIterableProps<T> | IForObjectProps<T>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type TFor = {
  <T>(props: IForObjectProps<T>): ReactNode;
  <T>(props: IForIterableProps<T>): ReactNode;
  Empty: TEmpty;
};

const ForComponent = function For<T>(props: TForProps<T>): ReactNode {
  const isObjectMode = Object.prototype.hasOwnProperty.call(props, 'in');
  const hasOf = Object.prototype.hasOwnProperty.call(props, 'of');

  if (isObjectMode && hasOf) {
    console.warn('Both "in" and "of" provided; using "in"');
  }

  const objOrGetter = (props as IForObjectProps<T>).in;
  const iterableOrGetter = !isObjectMode ? (props as IForIterableProps<T>).of : undefined;

  const obj = isFunction(objOrGetter) ? objOrGetter() : objOrGetter;
  const iterable = isFunction(iterableOrGetter) ? iterableOrGetter() : iterableOrGetter;

  const array =
    iterable ?
      Array.isArray(iterable) ?
        (iterable as T[])
      : Array.from(iterable)
    : undefined;

  const rawChildren = props.children;
  const childrenArray = Array.isArray(rawChildren) ? rawChildren : [rawChildren];

  const renderFn = childrenArray.find((child): child is TForChildRenderFn<T> =>
    isFunction(child),
  ) as TForChildRenderFn<T> | undefined;

  const fallbackSlot = childrenArray.find(
    (child): child is ReactElement<IEmptyProps> => isValidElement(child) && child.type === Empty,
  ) as ReactElement<IEmptyProps> | undefined;

  const fallbackProp: TFallback | undefined = props.empty;

  if (!renderFn) {
    console.warn('No render function provided');
    return null;
  }

  if (fallbackProp != null && fallbackSlot) {
    console.warn('Both "empty" prop and <Empty> provided; using "empty"');
  }

  const fallback: TFallback | undefined = fallbackProp ?? fallbackSlot?.props.children;

  const isEmpty = isObjectMode ? !obj || !Object.keys(obj).length : !array?.length;

  if (isEmpty) {
    const result = isFunction(fallback) ? fallback() : fallback;
    return result ?? null;
  }

  if (isObjectMode) {
    return Object.entries(obj!).map(([k, v]) => renderFn(v, k));
  } else {
    return array!.map((v, i) => renderFn(v, i));
  }
} satisfies FunctionComponent<TForProps<unknown>>;

export const For = ForComponent as TFor;
For.Empty = Empty;
