import type { FunctionComponent, ReactNode } from 'react';

import { isFunction } from '@/utils';

interface ILetProps<T> {
  value: T;
  children: (value: T) => ReactNode;
}

export const Let = function Let<T>(props: ILetProps<T>): ReactNode {
  const { value, children } = props;

  if (!isFunction(children)) {
    console.warn('No function child is provided');
    return null;
  }

  return children(value);
} satisfies FunctionComponent<ILetProps<unknown>>;
