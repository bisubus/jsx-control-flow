import type { ReactNode } from 'react';

export type TRenderFn = () => ReactNode;
export type TFallback = ReactNode | TRenderFn;
