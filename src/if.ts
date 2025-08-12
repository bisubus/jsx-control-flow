import {
  Children,
  type FunctionComponent,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import type { TFallback, TRenderFn } from './types';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export interface IElseProps {
  children: TFallback;
}

export const Else: FunctionComponent<IElseProps> = function Else(_props) {
  return null;
};

const renderNode = (node: ReactNode | TRenderFn) => (typeof node === 'function' ? node() : node);

interface IThenProps {
  children: ReactNode | TRenderFn;
}
export const Then: FunctionComponent<IThenProps> = function Then() {
  return null;
};

interface IBaseBranchProps {
  children: ReactNode | TRenderFn;
}

interface IElseIfConditionProps extends IBaseBranchProps {
  cond: boolean;
  getCond?: never;
}

interface IElseIfConditionGetterProps extends IBaseBranchProps {
  getCond: () => boolean;
  cond?: never;
}

type IElseIfProps = IElseIfConditionProps | IElseIfConditionGetterProps;

export const ElseIf: FunctionComponent<IElseIfProps> = function ElseIf() {
  return null;
};

interface IBaseConditionalProps {
  else?: TFallback;
  children: ReactNode | TRenderFn;
}

interface IIfConditionProps extends IBaseConditionalProps {
  cond: boolean;
  getCond?: never;
}

interface IIfConditionGetterProps extends IBaseConditionalProps {
  getCond: () => boolean;
  cond?: never;
}

type IIfProps = IIfConditionProps | IIfConditionGetterProps;

type TIf = FunctionComponent<IIfProps> & {
  Then: typeof Then;
  ElseIf: typeof ElseIf;
  Else: typeof Else;
};

export const If: TIf = function If(props: IIfProps) {
  const hasConditionGetter = hasOwnProperty.call(props, 'getCond');
  const hasCondition = hasOwnProperty.call(props, 'cond');

  if (hasConditionGetter && hasCondition) {
    console.warn('Both "getCond" and "cond" provided; "getCond" will be used');
  }

  const ifCondition = hasConditionGetter ? props.getCond!() : props.cond;

  const elseProp = props.else;
  const rawChildren = props.children;
  const rawChildrenArray = Array.isArray(rawChildren) ? rawChildren : [rawChildren];
  // eslint-disable-next-line react-x/no-children-to-array
  const children = Children.toArray(rawChildrenArray);

  const thenSlot = children.find(
    (child): child is ReactElement<IThenProps> => isValidElement(child) && child.type === Then,
  );

  const elseIfSlots = children.filter(
    (child): child is ReactElement<IElseIfProps> => isValidElement(child) && child.type === ElseIf,
  );

  const elseSlot = children.find(
    (child): child is ReactElement<IElseProps> => isValidElement(child) && child.type === Else,
  );

  const thenChild = children.find((child) => typeof child === 'function') as TRenderFn | undefined;

  if (!thenSlot && !thenChild) {
    console.warn('No render function or <Then> provided');
    return null;
  }

  if (elseProp != null && elseSlot != null) {
    console.warn('Both "else" prop and <Else> provided; "else" will be used');
  }

  if (ifCondition) {
    return thenSlot ? renderNode(thenSlot.props.children) : renderNode(thenChild!);
  }

  const fallback: TFallback | undefined = elseProp ?? elseSlot?.props.children;

  for (const elseIfSlot of elseIfSlots) {
    const hasConditionGetter = hasOwnProperty.call(elseIfSlot.props, 'getCond');
    const hasCondition = hasOwnProperty.call(elseIfSlot.props, 'cond');

    if (hasConditionGetter && hasCondition) {
      console.warn('Both "getCond" and "cond" provided; "getCond" will be used');
    }

    const result = hasConditionGetter ? elseIfSlot.props.getCond!() : elseIfSlot.props.cond;

    if (result) {
      return renderNode(elseIfSlot.props.children);
    }
  }

  return fallback ? renderNode(fallback) : null;
};

If.Then = Then;
If.ElseIf = ElseIf;
If.Else = Else;
