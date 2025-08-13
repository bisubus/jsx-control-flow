import { render, screen } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Let } from './Let';

describe('Let component', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('renders a function passing string value', () => {
    render(<Let value="hello">{(val) => <span>Value is: {val satisfies string}</span>}</Let>);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Value is: hello')).toBeInTheDocument();
  });

  it('renders a function passing numeric value', () => {
    render(<Let value={42}>{(val) => <div>Number: {val satisfies number}</div>}</Let>);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Number: 42')).toBeInTheDocument();
  });

  it('renders a function passing object value', () => {
    const obj = { foo: 'bar' };
    render(<Let value={obj}>{(val) => <pre>{JSON.stringify(val)}</pre>}</Let>);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText(JSON.stringify(obj))).toBeInTheDocument();
  });

  it('renders nothing when non-function child is provided', () => {
    const { container } = render(
      <Let value="x">{(<span>Not a function</span>) as unknown as () => ReactNode}</Let>,
    );

    expect(container.innerHTML).toBe('');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });
});
