import {
  Children,
  type FunctionComponent,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import { hasOwnProperty, isFunction } from '@/utils';

import type { TFallback, TRenderFn } from './types';

const renderNode = (node: ReactNode | TRenderFn): ReactNode => (isFunction(node) ? node() : node);

// Then slot
interface IThenProps {
  children: ReactNode | TRenderFn;
}

export const Then: FunctionComponent<IThenProps> = function Then() {
  return null;
};

// ElseIf slot
interface IElseIfBaseProps {
  children: ReactNode | TRenderFn;
}

interface IElseIfConditionProps {
  cond: unknown;
  getCond?: never;
}

interface IElseIfConditionGetterProps {
  getCond: () => unknown;
  cond?: never;
}

type TElseIfProps = IElseIfBaseProps & (IElseIfConditionProps | IElseIfConditionGetterProps);

export const ElseIf: FunctionComponent<TElseIfProps> = function ElseIf() {
  return null;
};

// Else slot
interface IElseProps {
  children: TFallback;
}

export const Else: FunctionComponent<IElseProps> = function Else() {
  return null;
};

// If component
type IIfConditionProps = IElseIfConditionProps;
type IIfConditionGetterProps = IElseIfConditionGetterProps;

interface IIfWithElseProp {
  else?: TFallback;
  children:
    | TRenderFn
    | [TRenderFn, ...ReactElement<TElseIfProps>[]]
    | ReactElement<IThenProps>
    | [ReactElement<IThenProps>, ...ReactElement<TElseIfProps>[]];
}

interface IIfWithElseSlot {
  else?: never;
  children:
    | TRenderFn
    | [TRenderFn, ...ReactElement<TElseIfProps>[]]
    | [TRenderFn, ...ReactElement<TElseIfProps>[], ReactElement<IElseProps>]
    | ReactElement<IThenProps>
    | [ReactElement<IThenProps>, ...ReactElement<TElseIfProps>[]]
    | [ReactElement<IThenProps>, ...ReactElement<TElseIfProps>[], ReactElement<IElseProps>];
}

type TIfProps = (IIfConditionProps | IIfConditionGetterProps) & (IIfWithElseProp | IIfWithElseSlot);

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type TIf = {
  (props: TIfProps): ReactNode;
  Then: typeof Then;
  ElseIf: typeof ElseIf;
  Else: typeof Else;
};

const IfComponent = function If(props: TIfProps): ReactNode {
  const hasConditionGetter = hasOwnProperty.call(props, 'getCond');
  const hasCondition = hasOwnProperty.call(props, 'cond');

  if (hasConditionGetter && hasCondition) {
    console.warn('Both "getCond" and "cond" provided; using "getCond"');
  }

  const ifCondition = hasConditionGetter ? props.getCond!() : props.cond;

  const rawChildren = props.children;
  const rawChildrenArray = Array.isArray(rawChildren) ? rawChildren : [rawChildren];
  // eslint-disable-next-line react-x/no-children-to-array
  const children = Children.toArray(rawChildrenArray as ReactNode[]);

  const thenSlot = children.find(
    (child): child is ReactElement<IThenProps> => isValidElement(child) && child.type === Then,
  );

  // Children.toArray removes functions, not documented
  const thenRenderFn = rawChildrenArray.find((child) => isFunction(child)) as TRenderFn | undefined;

  const elseIfSlots = children.filter(
    (child): child is ReactElement<TElseIfProps> => isValidElement(child) && child.type === ElseIf,
  );

  const elseSlot = children.find(
    (child): child is ReactElement<IElseProps> => isValidElement(child) && child.type === Else,
  );

  if (!thenSlot && !thenRenderFn) {
    console.warn('No render function or <Then> provided');
    return null;
  }

  const hasElseProp = hasOwnProperty.call(props, 'else');
  const elseProp: TFallback | undefined = hasElseProp ? (props as IIfWithElseProp).else : undefined;

  if (elseProp != null && elseSlot != null) {
    console.warn('Both "else" prop and <Else> provided; using "else"');
  }

  if (ifCondition) {
    return thenSlot ? renderNode(thenSlot.props.children) : renderNode(thenRenderFn!);
  }

  for (const elseIfSlot of elseIfSlots) {
    const hasConditionGetter = hasOwnProperty.call(elseIfSlot.props, 'getCond');
    const hasCondition = hasOwnProperty.call(elseIfSlot.props, 'cond');

    if (hasConditionGetter && hasCondition) {
      console.warn('Both "getCond" and "cond" provided; using "getCond"');
    }

    const result = hasConditionGetter ? elseIfSlot.props.getCond!() : elseIfSlot.props.cond;

    if (result) {
      return renderNode(elseIfSlot.props.children);
    }
  }

  const fallback = elseProp ?? elseSlot?.props.children;
  return fallback != null ? renderNode(fallback) : null;
} satisfies FunctionComponent<TIfProps>;

export const If: TIf = IfComponent as TIf;

If.Then = Then;
If.ElseIf = ElseIf;
If.Else = Else;
