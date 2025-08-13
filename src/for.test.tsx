import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Empty, For } from './For';

describe('For Component (Vitest + Testing Library)', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('has slot components', () => {
    expect(Empty).toEqual(expect.any(Function));

    expect(For.Empty).toBe(Empty);
  });

  it('renders an array', () => {
    render(
      <For of={[1, 2, 3]}>
        {(v, i) => (
          <span data-testid="item">
            {v}:{i}
          </span>
        )}
      </For>,
    );
    const items = screen.getAllByTestId('item').map((el) => el.textContent);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(items).toEqual(['1:0', '2:1', '3:2']);
  });

  it('renders an iterable set', () => {
    render(
      <For of={new Set(['a', 'b'])}>
        {(v, i) => (
          <div data-testid="item">
            {v}:{i}
          </div>
        )}
      </For>,
    );
    const items = screen.getAllByTestId('item').map((el) => el.textContent);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(items).toEqual(['a:0', 'b:1']);
  });

  it('renders an iterable string', () => {
    render(
      <For of="hi">
        {(ch, i) => (
          <p data-testid="item">
            {ch}:{i}
          </p>
        )}
      </For>,
    );
    const items = screen.getAllByTestId('item').map((el) => el.textContent);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(items).toEqual(['h:0', 'i:1']);
  });

  it('renders an iterable from a getter', () => {
    const getter = () => new Set([10, 20]);
    render(
      <For of={getter}>
        {(v, i) => (
          <span data-testid="item">
            {v + 1}:{i}
          </span>
        )}
      </For>,
    );
    const items = screen.getAllByTestId('item').map((el) => el.textContent);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(items).toEqual(['11:0', '21:1']);
  });

  it('renders an object', () => {
    const obj = { x: 'X', y: 'Y' };
    render(
      <For in={obj}>
        {(v, k) => (
          <div data-testid="item">
            {k}:{v}
          </div>
        )}
      </For>,
    );
    const items = screen.getAllByTestId('item').map((el) => el.textContent);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(items).toEqual(['x:X', 'y:Y']);
  });

  it('renders an object from a getter', () => {
    const getter = () => ({ a: 1, b: 2 });
    render(
      <For in={getter}>
        {(v, k) => (
          <p data-testid="item">
            {k}:{v}
          </p>
        )}
      </For>,
    );
    const items = screen.getAllByTestId('item').map((el) => el.textContent);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(items).toEqual(['a:1', 'b:2']);
  });

  it('falls back to "empty" prop for empty iterable', () => {
    render(
      <For
        of={[]}
        empty={<div data-testid="empty">No items</div>}
      >
        {(v) => <span>{v}</span>}
      </For>,
    );
    expect(screen.getByTestId('empty').textContent).toBe('No items');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('falls back to <Empty> slot for empty object', () => {
    render(
      <For in={() => ({})}>
        {(v) => <span>{v as ReactNode}</span>}
        <Empty>
          <div data-testid="empty">Empty</div>
        </Empty>
      </For>,
    );
    expect(screen.getByTestId('empty').textContent).toBe('Empty');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('falls back to <Empty> slot with no value', () => {
    render(
      <For {...({} as { of: unknown[] })}>
        {(v: unknown) => <span>{v as ReactNode}</span>}
        <Empty>
          <div data-testid="empty">Empty</div>
        </Empty>
      </For>,
    );
    expect(screen.getByTestId('empty').textContent).toBe('Empty');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('falls back to <Empty> slot with a getter with no value', () => {
    render(
      <For of={(() => {}) as unknown as unknown[]}>
        {(v: unknown) => <span>{v as ReactNode}</span>}
        <Empty>
          <i data-testid="empty">Empty</i>
        </Empty>
      </For>,
    );
    expect(screen.getByTestId('empty').textContent).toBe('Empty');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('prefers "empty" prop over `<Empty>` slot', () => {
    render(
      <For
        of={[]}
        empty="Empty prop"
        children={
          [
            (v: unknown) => <span>{v as ReactNode}</span>,
            // eslint-disable-next-line react-x/no-missing-key
            <Empty>Empty slot</Empty>,
          ] as unknown as (value: unknown, key: number) => ReactNode
        }
      />,
    );
    expect(screen.getByText('Empty prop')).toBeTruthy();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when no render function is provided', () => {
    const { container } = render(
      <For of={[1, 2, 3]}>
        {(<div>Content</div>) as unknown as (value: unknown, key: number) => ReactNode}
      </For>,
    );
    expect(container).toBeEmptyDOMElement();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('renders an object and ignores an array when both are provided', () => {
    const obj = { a: 1 };
    const arr = ['b', 'c'];
    render(
      <For
        in={obj}
        of={arr as unknown as undefined}
      >
        {(v, k) => (
          <span data-testid="item">
            {k}:{v}
          </span>
        )}
      </For>,
    );
    const item = screen.getByTestId('item').textContent;
    expect(item).toBe('a:1');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('selects the first function child when multiple are provided', () => {
    const fn1 = vi.fn((v: number) => <span data-testid="item1">{v}</span>);
    const fn2 = vi.fn((v: number) => <span data-testid="item2">{v * 10}</span>);
    render(
      <For
        of={[1, 2]}
        children={[fn1, fn2] as unknown as () => ReactNode}
      ></For>,
    );
    const items1 = screen.getAllByTestId('item1').map((el) => el.textContent);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(items1).toEqual(['1', '2']);
    expect(fn1).toHaveBeenCalledTimes(2);
    expect(fn2).not.toHaveBeenCalled();
  });
});
