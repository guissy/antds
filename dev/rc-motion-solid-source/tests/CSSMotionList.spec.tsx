import { type Component, createSignal } from "solid-js";
import classNames from 'classnames';
import { render, fireEvent, screen } from "solid-testing-library";
import { genCSSMotionList } from '../src/CSSMotionList';
import type { CSSMotionListProps } from '../src/CSSMotionList';
import { genCSSMotion } from '../src/CSSMotion';

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

describe('CSSMotionList', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe.only('diff should work', () => {
    function testMotion(
      CSSMotionList: Component<CSSMotionListProps>,
      injectLeave?: (wrapper: HTMLElement) => void,
    ) {
      let leaveCalled = 0;
      function onLeaveEnd() {
        leaveCalled += 1;
      }

      const Demo_ = (props: { keys: string[] }) => (
        <CSSMotionList
          motionName="transition"
          motionAppear={false}
          motionEnter={false}
          // motionLeave={false}
          keys={props.keys}
          onLeaveEnd={onLeaveEnd}
        >
          {(props: { key, style, className }) => (
            <div
              data-key={props.key}
              style={props.style}
              class={classNames('motion-box', props.className)}
            >
              {props.key}
            </div>
          )}
        </CSSMotionList>
      );

      const Demo = wrapFC(Demo_)
      const { container } = render(() => <Demo keys={['a', 'b']} />);

      function checkKeys(targetKeys: number | string[]) {
        const nodeList = Array.from(
          container.querySelectorAll<HTMLDivElement>('.motion-box'),
        );
        const keys = nodeList.map(node => node.textContent);
        expect(keys).toEqual(targetKeys);
      }

      checkKeys(['a', 'b']);

      // Change to ['c', 'd']
      
        jest.runAllTimers();
      

      // rerender(() => <Demo keys={['c', 'd']} />);
      Demo.setProps({ keys: ["c", "d"] });
      
        jest.runAllTimers();
      

      // Inject leave event
      if (injectLeave) {
        
          injectLeave(container);
        
      }

      
        jest.runAllTimers();
      
      checkKeys(['c', 'd']);

      if (injectLeave) {
        expect(leaveCalled).toEqual(2);
      }
    }

    it('with motion support', () => {
      const CSSMotion = genCSSMotion({
        transitionSupport: true,
        forwardRef: false,
      });
      const CSSMotionList = genCSSMotionList(true, CSSMotion);
      testMotion(CSSMotionList, container => {
        const nodeList = Array.from(container.querySelectorAll('.motion-box'));
        nodeList.slice(0, 2).forEach(node => {
          fireEvent.transitionEnd(node);
        });
      });
    });

    it('without motion support', () => {
      const CSSMotionList = genCSSMotionList(false);
      testMotion(CSSMotionList);
    });
  });

  it('onVisibleChanged', () => {
    const onVisibleChanged = jest.fn();
    const onAllRemoved = jest.fn();
    const CSSMotionList = genCSSMotionList(false);

    const Demo = (props) => (
      <CSSMotionList
        motionName="transition"
        keys={props.keys}
        onVisibleChanged={onVisibleChanged}
        onAllRemoved={onAllRemoved}
      >
        {(props: { key, style, className }) => (
          <div
            data-key={props.key}
            style={props.style}
            class={classNames('motion-box', props.className)}
          >
            {props.key}
          </div>
        )}
      </CSSMotionList>
    );

    const { rerender } = render(() => <Demo keys={['a']} />);
    expect(onAllRemoved).not.toHaveBeenCalled();

    
      jest.runAllTimers();
    

    expect(onVisibleChanged).toHaveBeenCalledWith(true, { key: 'a' });
    onVisibleChanged.mockReset();
    expect(onAllRemoved).not.toHaveBeenCalled();

    // Remove
    rerender(() => <Demo keys={[]} />);
    
      jest.runAllTimers();
    

    expect(onVisibleChanged).toHaveBeenCalledWith(false, { key: 'a' });
    expect(onAllRemoved).toHaveBeenCalled();
  });
});
