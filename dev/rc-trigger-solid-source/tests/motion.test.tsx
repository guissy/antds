import { render, fireEvent, screen, cleanup } from "solid-testing-library";
import Trigger from '../src';
import { placementAlignMap } from './util';
import { createSignal } from "solid-js";
const wrapFC = (Cmp) => {
  const fn = (props) => {
    const [state, setState] = createSignal(props);
    (fn as unknown as { setProps }).setProps = (n) => {
      setState(p => Object.keys(n).some((k) => p[k] !== n[k]) ? Object.assign({}, p, n) : p);
    };
    return <Cmp {...state}>{state().children}</Cmp>
  }
  return fn as typeof fn & { setProps: (o: object) => void }
}

describe('Trigger.Motion', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('popup should support motion', async () => {
    const { container } = render(() => 
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong class="x-content" />}
        popupMotion={{
          motionName: 'bamboo',
        }}
      >
        <div class="target">click</div>
      </Trigger>,
    );
    const target = container.querySelector('.target');

    fireEvent.click(target);

    expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
      'bamboo-appear',
    );

    expect(
      document.querySelector('.rc-trigger-popup').style['pointer-events'],
    ).toEqual('');
  });

  it('use correct leave motion', () => {
    // const cssMotionSpy = jest.spyOn(CSSMotion, 'render');
    const { container } = render(() => 
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong class="x-content" />}
        popupMotion={{
          leavedClassName: 'light',
        }}
      >
        <div class="target">click</div>
      </Trigger>,
    );
    const target = container.querySelector('.target');
    fireEvent.click(target);
    fireEvent.click(target);
    jest.runAllTimers();
    expect(document.querySelector('.rc-trigger-popup')).toHaveClass("light")
  });

  it('not lock on appear', () => {
    const genTrigger = (props) => (
      <Trigger
        popup={<strong class="x-content" />}
        popupMotion={{
          motionName: 'bamboo',
        }}
        popupVisible
        {...props}
      >
        <span />
      </Trigger>
    );
    const GenTrigger = wrapFC(genTrigger);
    render(() => <GenTrigger />);
    jest.runAllTimers();
    expect(document.querySelector('.rc-trigger-popup')).not.toHaveStyle({
      'pointer-events': 'none',
    });

    // rerender(() => genTrigger({ popupVisible: false }));
    GenTrigger.setProps({ popupVisible: false });
    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      'pointer-events': 'none',
    });
  });
});
