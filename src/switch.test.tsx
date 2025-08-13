import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Case, Default, Switch } from './Switch';

describe('Switch component', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('has slot components', () => {
    expect(Case).toEqual(expect.any(Function));
    expect(Default).toEqual(expect.any(Function));

    expect(Switch.Case).toBe(Case);
    expect(Switch.Default).toBe(Default);
  });

  it('renders matching case', () => {
    render(
      <Switch value="a">
        <Case value="a">
          <span>Case A</span>
        </Case>
        <Case value="b">
          <span>Case A</span>
        </Case>
        <Default>
          <span>Default</span>
        </Default>
      </Switch>,
    );

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Case A')).toBeInTheDocument();
    expect(screen.queryByText('Case B')).toBeNull();
    expect(screen.queryByText('Default')).toBeNull();
  });

  it('renders default when no case matches', () => {
    render(
      <Switch value="c">
        <Case value="b">
          <span>Case A</span>
        </Case>
        <Case value="b">
          <span>Case A</span>
        </Case>
        <Default>
          <span>Default</span>
        </Default>
      </Switch>,
    );

    expect(warnSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.queryByText('Case A')).toBeNull();
    expect(screen.queryByText('Case B')).toBeNull();
  });

  it('renders nothing and warns when no case or default provided', () => {
    /* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */
    const { container } = render(
      <Switch
        value="x"
        children={undefined as any}
      />,
    );
    /* eslint-enable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */

    expect(container.innerHTML).toBe('');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('uses getValue when both getValue and value props are provided', () => {
    render(
      <Switch
        value={'ignored' as unknown as undefined}
        getValue={() => 'value'}
      >
        <Case value="value">
          <span>Value from a getter</span>
        </Case>
        <Default>
          <span>Default</span>
        </Default>
      </Switch>,
    );

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Value from a getter')).toBeInTheDocument();
  });

  it('uses the first default slot when multiple are provided', () => {
    render(
      <Switch value="none">
        <Default>
          <span>First default</span>
        </Default>
        <Default>
          <span>Second default</span>
        </Default>
      </Switch>,
    );

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText('First default')).toBeInTheDocument();
  });

  it('supports render function for case slot', () => {
    render(
      <Switch value="value">
        <Case value="value">{() => <span>Lazy case</span>}</Case>
      </Switch>,
    );

    expect(screen.getByText('Lazy case')).toBeInTheDocument();
  });

  it('supports render function for default slot', () => {
    render(
      <Switch value="no-match">
        <Default>{() => <span>Lazy default</span>}</Default>
      </Switch>,
    );

    expect(screen.getByText('Lazy default')).toBeInTheDocument();
  });

  it('works with strict equality matching', () => {
    const a = {};
    const b = {};

    render(
      <Switch value={b}>
        <Case value={a}>
          <span>Object A</span>
        </Case>
        <Case value={b}>
          <span>Object B</span>
        </Case>
      </Switch>,
    );

    expect(screen.getByText('Object B')).toBeInTheDocument();
  });
});
