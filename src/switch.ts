import {
  Children,
  type FunctionComponent,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

const hasOwnProperty = Object.prototype.hasOwnProperty;

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

type TSwitchValueGetter<T, TVar = never> = (value?: TVar) => T;

interface ISwitchValueProps<T = unknown> {
  getValue?: never;
  value: T;
  children: ReactNode;
}

interface ISwitchValueGetterProps<T = unknown> {
  getValue: TSwitchValueGetter<T>;
  value?: never;
  children: ReactNode;
}

type TSwitchProps<T = unknown> = ISwitchValueGetterProps<T> | ISwitchValueProps<T>;

type TSwitch = FunctionComponent<TSwitchProps> & {
  Case: typeof Case;
  Default: typeof Default;
};

function renderNode(node: ReactNode | TRenderFn) {
  return typeof node === 'function' ? node() : node;
}

export const Switch: TSwitch = function Switch<T>(props: TSwitchProps<T>) {
  const hasValueGetter = hasOwnProperty.call(props, 'getValue');
  const hasValue = hasOwnProperty.call(props, 'value');

  if (hasValueGetter && hasValue) {
    console.warn('Both "getValue" and "value" provided; "getValue" will be used');
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
};

Switch.Case = Case;
Switch.Default = Default;
