import type { FunctionComponent, ReactNode } from 'react';

interface ILetProps<T> {
  value: T;
  children: (value: T) => ReactNode;
}

export const Let: FunctionComponent<ILetProps<unknown>> = function Let<T>(props: ILetProps<T>) {
  const { value, children } = props;

  if (typeof children !== 'function') {
    console.warn('Expects a function as a child');
    return null;
  }

  return children(value);
};
