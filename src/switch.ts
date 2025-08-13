import {
  Children,
  type FunctionComponent,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import { hasOwnProperty, isFunction } from '@/utils';

type TRenderFn = () => ReactNode;

interface ICaseProps<T = unknown> {
  value: T;
  children: ReactNode | TRenderFn;
}
export const Case: FunctionComponent<ICaseProps> = function Case() {
  return null;
};

interface IDefaultProps {
  children: ReactNode | TRenderFn;
}
export const Default: FunctionComponent<IDefaultProps> = function Default() {
  return null;
};

type TSwitchValueGetter<T> = () => T;

interface ISwitchBaseProps {
  children:
    | ReactElement<ICaseProps>
    | ReactElement<IDefaultProps>
    | [...ReactElement<ICaseProps>[]]
    | [...ReactElement<ICaseProps>[], ReactElement<IDefaultProps>];
}

interface ISwitchValueProps<T = unknown> {
  getValue?: never;
  value: T;
}

interface ISwitchValueGetterProps<T = unknown> {
  getValue: TSwitchValueGetter<T>;
  value?: never;
}

type TSwitchProps<T = unknown> = ISwitchBaseProps &
  (ISwitchValueGetterProps<T> | ISwitchValueProps<T>);

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type TSwitch = {
  <T>(props: TSwitchProps<T>): ReactNode;
  Case: typeof Case;
  Default: typeof Default;
};

function renderNode(node: ReactNode | TRenderFn) {
  return isFunction(node) ? node() : node;
}

const SwitchComponent = function Switch<T>(props: TSwitchProps<T>): ReactNode {
  const hasValueGetter = hasOwnProperty.call(props, 'getValue');
  const hasValue = hasOwnProperty.call(props, 'value');

  if (hasValueGetter && hasValue) {
    console.warn('Both "getValue" and "value" provided; using "getValue"');
  }

  const value: T = hasValueGetter ? props.getValue!() : props.value!;

  // eslint-disable-next-line react-x/no-children-to-array
  const rawChildrenArray = Children.toArray(props.children);

  const caseSlots = rawChildrenArray.filter(
    (child): child is ReactElement<ICaseProps<T>> => isValidElement(child) && child.type === Case,
  );

  const defaultSlot = rawChildrenArray.find(
    (child): child is ReactElement<IDefaultProps> =>
      isValidElement(child) && child.type === Default,
  );

  if (!defaultSlot && !caseSlots.length) {
    console.warn('No <Case> or <Default> provided');
    return null;
  }

  if (
    rawChildrenArray.filter((child) => isValidElement(child) && child.type === Default).length > 1
  ) {
    console.warn('Multiple <Default> found');
  }

  const matchedCase = caseSlots.find((slot) => slot.props.value === value);

  if (matchedCase) {
    return renderNode(matchedCase.props.children);
  }

  return defaultSlot ? renderNode(defaultSlot.props.children) : null;
} satisfies FunctionComponent<TSwitchProps<unknown>>;

export const Switch = SwitchComponent as TSwitch;

Switch.Case = Case;
Switch.Default = Default;
