import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Else, ElseIf, If, Then } from './If';

describe('If component', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('has slot components', () => {
    expect(Then).toEqual(expect.any(Function));
    expect(ElseIf).toEqual(expect.any(Function));
    expect(Else).toEqual(expect.any(Function));

    expect(If.Then).toBe(Then);
    expect(If.ElseIf).toBe(ElseIf);
    expect(If.Else).toBe(Else);
  });

  it('renders child function when a condition is true', () => {
    render(<If cond={1}>{() => <span>Render function</span>}</If>);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Render function')).toBeInTheDocument();
  });

  it('renders else prop instead of a child when a condition is false', () => {
    render(
      <If
        cond={0}
        else={<div>Else prop</div>}
      >
        {() => <span>Render function</span>}
      </If>,
    );

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Else prop')).toBeInTheDocument();
  });

  it('renders <Then> when a condition is true', () => {
    render(
      <If cond={'true'}>
        <Then>
          <span>Then slot</span>
        </Then>
      </If>,
    );

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Then slot')).toBeInTheDocument();
  });

  it('renders else prop instead of <Then> when a condition is false', () => {
    render(
      <If
        cond={''}
        else={<span>Else prop</span>}
      >
        <Then>
          <span>Then slot</span>
        </Then>
      </If>,
    );

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Else prop')).toBeInTheDocument();
    expect(screen.queryByText('Then slot')).toBeNull();
  });

  it('renders <Else> slot instead of <Then> when a condition is false', () => {
    render(
      <If cond={false}>
        <Then>
          <span>Then</span>
        </Then>
        <Else>
          <span>Else slot</span>
        </Else>
      </If>,
    );

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Else slot')).toBeInTheDocument();
    expect(screen.queryByText('Then')).toBeNull();
  });

  it('renders first matching ElseIf slot', () => {
    render(
      <If cond={false}>
        <Then>
          <span>Then</span>
        </Then>
        <ElseIf cond={false}>
          <span>First else if</span>
        </ElseIf>
        <ElseIf cond={true}>
          <span>Second else if</span>
        </ElseIf>
        <Else>
          <span>Else slot</span>
        </Else>
      </If>,
    );

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Second else if')).toBeInTheDocument();
    expect(screen.queryByText('Else slot')).toBeNull();
  });

  it('renders nothing when no <Then> or render function provided', () => {
    const { container } = render(
      <If
        cond={false}
        children={null as unknown as () => ReactNode}
      />,
    );

    expect(container.innerHTML).toBe('');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('uses getCond when both cond and getCond props are provided', () => {
    render(
      <If
        cond={false as unknown as undefined}
        getCond={() => true}
      >
        <Then>
          <span>Then slot</span>
        </Then>
      </If>,
    );

    expect(screen.getByText('Then slot')).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('uses else prop when both else prop and <Else> provided', () => {
    render(
      <If
        cond={false}
        else={<span>Else prop</span>}
      >
        <Then>
          <span>Then slot</span>
        </Then>
        <Else>
          <span>Else slot</span>
        </Else>
      </If>,
    );

    expect(screen.getByText('Else prop')).toBeInTheDocument();
    expect(screen.queryByText('Else slot')).toBeNull();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('supports render function for ElseIf slot', () => {
    render(
      <If cond={false}>
        <Then>
          <span>Then</span>
        </Then>
        <ElseIf cond={true}>{() => <span>Lazy else if</span>}</ElseIf>
      </If>,
    );

    expect(screen.getByText('Lazy else if')).toBeInTheDocument();
  });

  it('supports render function for Else slot', () => {
    render(
      <If cond={false}>
        <Then>
          <span>Then</span>
        </Then>
        <Else>{() => <span>Lazy else</span>}</Else>
      </If>,
    );

    expect(screen.getByText('Lazy else')).toBeInTheDocument();
  });
});
