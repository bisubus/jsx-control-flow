import {
  Children,
  type FunctionComponent,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

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

interface ISwitchProps<T = unknown> {
  value: T;
  children: ReactNode;
}

type TSwitch = FunctionComponent<ISwitchProps> & {
  Case: typeof Case;
  Default: typeof Default;
};

function renderNode(node: ReactNode | TRenderFn) {
  return typeof node === 'function' ? node() : node;
}

export const Switch: TSwitch = function Switch<T>(props: ISwitchProps<T>) {
  const { value, children } = props;
  // eslint-disable-next-line react-x/no-children-to-array
  const rawChildrenArray = Children.toArray(children);

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
