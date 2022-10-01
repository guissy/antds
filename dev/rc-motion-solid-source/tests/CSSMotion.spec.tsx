/* eslint-disable
  react/no-render-return-value, max-classes-per-file,
  react/prefer-stateless-function, react/no-multi-comp
*/
import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import { act } from 'react-dom/test-utils';
import classNames from 'classnames';
import { render, fireEvent, screen } from "solid-testing-library";
import type { CSSMotionProps } from '../src/CSSMotion';
import RefCSSMotion, { genCSSMotion } from '../src/CSSMotion';
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


describe('CSSMotion', () => {
  const CSSMotion = genCSSMotion({
    transitionSupport: true,
    forwardRef: false,
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe.only('transition', () => {
    function onCollapse() {
      return { height: 0 };
    }
    function onExpand() {
      return { height: '100px' };
    }

    const actionList: {
      name: string;
      props: CSSMotionProps;
      visibleQueue: boolean[];
      oriHeight: number;
      tgtHeight: number;
    }[] = [
        {
          name: 'appear',
          props: {
            motionAppear: true,
            onAppearStart: onCollapse,
            onAppearActive: onExpand,
          },
          visibleQueue: [true],
          oriHeight: 0,
          tgtHeight: 100,
        },
        {
          name: 'enter',
          props: {
            motionEnter: true,
            onEnterStart: onCollapse,
            onEnterActive: onExpand,
          },
          visibleQueue: [false, true],
          oriHeight: 0,
          tgtHeight: 100,
        },
        {
          name: 'leave',
          props: {
            motionLeave: true,
            onLeaveStart: onExpand,
            onLeaveActive: onCollapse,
          },
          visibleQueue: [true, false],
          oriHeight: 100,
          tgtHeight: 0,
        },
      ];

    actionList.forEach(
      ({ name, props, visibleQueue, oriHeight, tgtHeight }) => {
        const Demo_ = (props_: { visible: boolean }) => {
          return (
            <CSSMotion
              motionName="transition"
              motionAppear={false}
              motionEnter={false}
              motionLeave={false}
              visible={props_.visible}
              {...props}
            >
              {(props: { style, className, visible }, ref) => {
                // TODO: visible
                // expect(props.visible).toEqual(props_.visible);
                return (
                  <div
                    ref={ref}
                    style={props.style}
                    class={classNames('motion-box', props.className)}
                  />
                );
              }}
            </CSSMotion>
          );
        };
        const Demo = wrapFC(Demo_)
        it(name, () => {
          const nextVisible = visibleQueue[1];

          const { container } = render(() =>
            <Demo visible={visibleQueue[0]} />,
          );

          function doStartTest() {
            const boxNode = container.querySelector('.motion-box') as HTMLDivElement;

            expect(boxNode).toHaveClass('transition');

            expect(boxNode).toHaveClass(`transition-${name}`);
            expect(boxNode).not.toHaveClass(`transition-${name}-active`);
            // expect(boxNode.offsetHeight).toBe(0);
            expect(boxNode).toHaveStyle({
              height: `${oriHeight}px`,
            });

            // Motion active

            jest.runAllTimers();


            const activeBoxNode = container.querySelector('.motion-box');
            expect(activeBoxNode).toHaveClass('transition');
            expect(activeBoxNode).toHaveClass(`transition-${name}`);
            expect(activeBoxNode).toHaveClass(`transition-${name}-active`);

            // expect(boxNode.offsetHeight).toBe(100);
            expect(activeBoxNode).toHaveStyle({
              height: `${tgtHeight}px`,
            });

            // Motion end
            fireEvent.transitionEnd(activeBoxNode);


            jest.runAllTimers();


            if (nextVisible === false) {
              expect(container.querySelector('.motion-box')).toBeFalsy();
            } else if (nextVisible !== undefined) {
              // screen.debug()
              const finalBoxNode: HTMLElement =
                container.querySelector('.motion-box');
              expect(finalBoxNode).not.toHaveClass('transition');
              expect(finalBoxNode).not.toHaveClass(`transition-${name}`);
              expect(finalBoxNode).not.toHaveClass(`transition-${name}-active`);

              // TODO: cssText
              // expect(finalBoxNode.style.cssText).toEqual('');
            }
          }

          // Delay for the visible finished
          if (nextVisible !== undefined) {
            // rerender(() => <Demo visible={nextVisible} />);
            Demo.setProps({ visible: nextVisible });
            doStartTest();
          } else {
            doStartTest();
          }
        });
      },
    );

    it('stop transition if config motion to false', () => {
      const Demo_ = (props?: CSSMotionProps) => (
        <CSSMotion motionName="transition" visible {...props}>
          {({ style, className }) => (
            <div
              style={style}
              class={classNames('motion-box', className)}
            />
          )}
        </CSSMotion>
      );
      const Demo = wrapFC(Demo_)
      const { container } = render(() => <Demo />);
      let boxNode = container.querySelector('.motion-box');
      expect(boxNode).toHaveClass('transition');
      expect(boxNode).toHaveClass('transition-appear');
      expect(boxNode).not.toHaveClass('transition-appear-active');

      // rerender(() => genMotion({ motionAppear: false }));
      Demo.setProps({ motionName: null })
      jest.runAllTimers();


      boxNode = container.querySelector('.motion-box');
      expect(boxNode).not.toHaveClass('transition');
      expect(boxNode).not.toHaveClass('transition-appear');
      expect(boxNode).not.toHaveClass('transition-appear-active');
    });

    it('quick switch should have correct status', async () => {
      const Demo_ = (props?: CSSMotionProps) => (
        <CSSMotion motionName="transition" {...props}>
          {({ style, className }) => (
            <div
              style={style}
              class={classNames('motion-box', className)}
            />
          )}
        </CSSMotion>
      );
      const Demo = wrapFC(Demo_)
      const { container, rerender, unmount } = render(() => <Demo />);

      // rerender(() => genMotion({ visible: true }));
      Demo.setProps({ visible: true })
      jest.runAllTimers();


      // rerender(() => genMotion({ visible: false }));
      Demo.setProps({ visible: false })

      jest.runAllTimers();


      let boxNode = container.querySelector('.motion-box');
      expect(boxNode).toHaveClass('transition');
      expect(boxNode).toHaveClass('transition-leave');
      expect(boxNode).toHaveClass('transition-leave-active');

      // rerender(() => genMotion({ visible: true }));
      Demo.setProps({ visible: true })
      await Promise.resolve();
      // rerender(() => genMotion({ visible: false }));
      Demo.setProps({ visible: false })

      jest.runAllTimers();

      boxNode = container.querySelector('.motion-box');
      expect(boxNode).toHaveClass('transition');
      expect(boxNode).toHaveClass('transition-leave');
      expect(boxNode).toHaveClass('transition-leave-active');

      unmount();
    });

    describe('deadline should work', () => {
      function test(name: string, Component: Component<any>) {
        it(name, () => {
          const onAppearEnd = jest.fn();
          render(() =>
            <CSSMotion
              motionName="transition"
              motionDeadline={1000}
              onAppearEnd={onAppearEnd}
              visible
            >
              {({ style, className }, ref) => (
                <Component
                  ref={ref}
                  style={style}
                  class={classNames('motion-box', className)}
                />
              )}
            </CSSMotion>,
          );

          // Motion Active

          jest.advanceTimersByTime(800);


          expect(onAppearEnd).not.toHaveBeenCalled();

          jest.runAllTimers();

          expect(onAppearEnd).toHaveBeenCalled();
        });
      }

      test(
        'without ref',
        (props => <div {...props} />),
      );

      test(
        'FC with ref',
        (props) => <div {...props} ref={props.ref} />,
      );

      // test(
      //   'FC but not dom ref',
      //  (props => {
      //     // React.useImperativeHandle(ref, () => ({}));
      //     return <div {...props} />;
      //   }),
      // );
    });

    it('not crash when no children', () => {
      const { container } = render(() =>
        <CSSMotion motionName="transition" visible />,
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe.only('animation', () => {
    const actionList = [
      {
        name: 'appear',
        props: { motionAppear: true },
        visibleQueue: [true],
      },
      {
        name: 'enter',
        props: { motionEnter: true },
        visibleQueue: [false, true],
      },
      {
        name: 'leave',
        props: { motionLeave: true },
        visibleQueue: [true, false],
      },
    ];

    actionList.forEach(({ name, visibleQueue, props }) => {
      const Demo_ = ({ visible }: { visible: boolean }) => (
        <CSSMotion
          motionName="animation"
          motionAppear={false}
          motionEnter={false}
          motionLeave={false}
          visible={visible}
          {...props}
        >
          {(props: { style, className }, ref) => (
            <div
              ref={ref}
              style={props.style}
              class={classNames('motion-box', props.className)}
            />
          )}
        </CSSMotion>
      );
      const Demo = wrapFC(Demo_)
      it(name, () => {
        const { container } = render(() =>
          <Demo visible={visibleQueue[0]} />,
        );
        const nextVisible = visibleQueue[1];

        function doStartTest() {
          // Motion active

          jest.runAllTimers();

          const activeBoxNode = container.querySelector('.motion-box');
          expect(activeBoxNode).toHaveClass('animation');
          expect(activeBoxNode).toHaveClass(`animation-${name}`);
          expect(activeBoxNode).toHaveClass(`animation-${name}-active`);
        }

        // Delay for the visible finished
        if (nextVisible !== undefined) {
          // rerender(() => <Demo visible={nextVisible} />);
          Demo.setProps({ visible: nextVisible })
          doStartTest();
        } else {
          doStartTest();
        }
      });
    });
  });

  it('not block motion when motion set delay', () => {
    const Demo_ = (props?: CSSMotionProps) => (
      <CSSMotion visible {...props}>
        {({ style, className }) => (
          <div style={style} class={classNames('motion-box', className)} />
        )}
      </CSSMotion>
    );
    const Demo = wrapFC(Demo_)
    const { container } = render(() => <Demo />);

    // rerender(() => 
    //   genMotion({
    //     motionName: 'animation',
    //     motionLeave: true,
    //     visible: false,
    //   }),
    // );
    Demo.setProps({
      motionName: 'animation',
      motionLeave: true,
      visible: false,
    })

    jest.runAllTimers();


    const activeBoxNode = container.querySelector('.motion-box');
    expect(activeBoxNode).toHaveClass(`animation-leave-active`);
  });

  describe('immediately', () => {
    it('motionLeaveImmediately', async () => {
      const { container } = render(() =>
        <CSSMotion
          motionName="transition"
          motionLeaveImmediately
          visible={false}
        >
          {({ style, className }) => (
            <div
              style={style}
              class={classNames('motion-box', className)}
            />
          )}
        </CSSMotion>,
      );

      const boxNode = container.querySelector('.motion-box');
      expect(boxNode).toHaveClass('transition');
      expect(boxNode).toHaveClass('transition-leave');
      expect(boxNode).not.toHaveClass('transition-leave-active');

      // Motion active
      await act(async () => {
        jest.runAllTimers();
        await Promise.resolve();
      });

      const activeBoxNode = container.querySelector('.motion-box');
      expect(activeBoxNode).toHaveClass('transition');
      expect(activeBoxNode).toHaveClass('transition-leave');
      expect(activeBoxNode).toHaveClass('transition-leave-active');
    });
  });

  it('no transition', () => {
    const NoCSSTransition = genCSSMotion({
      transitionSupport: false,
      forwardRef: false,
    });

    const { container } = render(() =>
      <NoCSSTransition motionName="transition">
        {({ style, className }) => (
          <div style={style} class={classNames('motion-box', className)} />
        )}
      </NoCSSTransition>,
    );

    const boxNode = container.querySelector('.motion-box');
    expect(boxNode).not.toHaveClass('transition');
    expect(boxNode).not.toHaveClass('transition-appear');
    expect(boxNode).not.toHaveClass('transition-appear-active');
  });

  it('forwardRef', () => {
    let domRef = null;
    render(() =>
      <RefCSSMotion motionName="transition" ref={domRef}>
        {({ style, className }, ref) => (
          <div
            ref={ref}
            style={style}
            class={classNames('motion-box', className)}
          />
        )}
      </RefCSSMotion>,
    );

    expect(domRef instanceof HTMLElement).toBeTruthy();
  });

  it("onMotionEnd shouldn't be fired by inner element", () => {
    const onLeaveEnd = jest.fn();

    const Demo_ = (props?: CSSMotionProps) => (
      <CSSMotion
        visible
        motionName="bamboo"
        onLeaveEnd={onLeaveEnd}
        removeOnLeave={false}
        {...props}
      >
        {(_, ref) => (
          <div class="outer-block" ref={ref}>
            <div class="inner-block" />
          </div>
        )}
      </CSSMotion>
    );
    const Demo = wrapFC(Demo_)
    const { container } = render(() => <Demo />);

    function resetLeave() {
      // rerender(() => genMotion({ visible: true }));
      Demo.setProps({ visible: true })

      jest.runAllTimers();


      // rerender(() => genMotion({ visible: false }));
      Demo.setProps({ visible: false })

      jest.runAllTimers();

    }

    // Outer
    resetLeave();
    fireEvent.transitionEnd(container.querySelector('.outer-block'));
    expect(onLeaveEnd).toHaveBeenCalledTimes(1);

    // Outer
    resetLeave();
    fireEvent.transitionEnd(container.querySelector('.outer-block'));
    expect(onLeaveEnd).toHaveBeenCalledTimes(2);

    // Inner
    resetLeave();
    fireEvent.transitionEnd(container.querySelector('.inner-block'));
    expect(onLeaveEnd).toHaveBeenCalledTimes(2);
  });

  it('switch dom should work', () => {
    const onLeaveEnd = jest.fn();

    const Demo_ = (props) => {
      const Component = props.Component;
      return (<CSSMotion
        visible={props.visible}
        onLeaveEnd={onLeaveEnd}
        motionDeadline={233}
        motionName="bamboo"
      >
        {({ style, className }) => (
          <Component
            style={style}
            class={classNames('motion-box', className)}
          />
        )}
      </CSSMotion>
      )
    };
    const Demo = wrapFC(Demo_)
    render(() => <Demo Component={(props) => <div>{props.children}</div>} visible={true} />);

    // Active

    jest.runAllTimers();


    // Hide
    // rerender(() => genMotion('p', false));
    Demo.setProps({ Component: (props) => <p>{props.children}</p>, visible: false })
    // Active

    jest.runAllTimers();


    // Deadline

    jest.runAllTimers();


    expect(onLeaveEnd).toHaveBeenCalled();
  });

  it('prepare should block motion start', async () => {
    let lockResolve: Function;
    const onAppearPrepare = jest.fn(
      () =>
        new Promise(resolve => {
          lockResolve = resolve;
        }),
    );

    const { container } = render(() =>
      <CSSMotion visible motionName="bamboo" onAppearPrepare={onAppearPrepare}>
        {({ style, className }) => (
          <div style={style} class={classNames('motion-box', className)} />
        )}
      </CSSMotion>,
    );


    jest.runAllTimers();


    // Locked
    expect(container.querySelector('.motion-box')).toHaveClass(
      'bamboo-appear-prepare',
    );

    // Release
    // await act(async () => {
    lockResolve();
    // await Promise.resolve();
    // });


    jest.runAllTimers();


    expect(container.querySelector('.motion-box')).not.toHaveClass(
      'bamboo-appear-prepare',
    );
  });

  it('forceRender', () => {
    const Demo_ = (props?: CSSMotionProps) => (
      <CSSMotion forceRender motionName="bamboo" visible={false} {...props}>
        {({ style, className }) => (
          <div style={style} class={classNames('motion-box', className)} />
        )}
      </CSSMotion>
    );
    const Demo = wrapFC(Demo_)
    const { container, rerender } = render(() => <Demo />);

    expect(container.querySelector('.motion-box')).toHaveStyle({
      display: 'none',
    });

    // Reset should hide
    // rerender(() => genMotion({ forceRender: false }));
    Demo.setProps({ forceRender: false })
    expect(container.querySelector('.motion-box')).toBeFalsy();
  });

  it('render null on first when removeOnLeave is false', () => {
    const Demo_ = (props?: CSSMotionProps) => (
      <CSSMotion
        motionName="bamboo"
        removeOnLeave={false}
        leavedClassName="removed"
        visible={false}
        {...props}
      >
        {({ style, className }) => (
          <div style={style} class={classNames('motion-box', className)} />
        )}
      </CSSMotion>
    );
    const Demo = wrapFC(Demo_)
    const { container, rerender } = render(() => <Demo />);

    expect(container.querySelector('.motion-box')).toBeFalsy();

    // Visible
    // rerender(() => genMotion({ visible: true }));
    Demo.setProps({ visible: true })

    jest.runAllTimers();

    expect(container.querySelector('.motion-box')).toBeTruthy();

    // Hide again
    // rerender(() => genMotion({ visible: false }));
    Demo.setProps({ visible: false })

    jest.runAllTimers();


    fireEvent.transitionEnd(container.querySelector('.motion-box'));

    expect(container.querySelector('.motion-box')).toBeTruthy();
    expect(container.querySelector('.motion-box')).toHaveClass('removed');
  });

  describe('strict mode', () => {
    beforeEach(() => {
      // jest.spyOn(ReactDOM, 'findDOMNode');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls findDOMNode when no refs are passed', () => {
      const Div = () => <div />;
      render(() =>
        <CSSMotion motionName="transition" visible>
          {() => <Div />}
        </CSSMotion>,
      );


      jest.runAllTimers();

      // TODO: findDOMNode
      // expect(ReactDOM.findDOMNode).toHaveBeenCalled();
    });

    it('does not call findDOMNode when ref is passed internally', () => {
      render(() =>
        <CSSMotion motionName="transition" visible>
          {(props, ref) => <div ref={ref} />}
        </CSSMotion>,
      );


      jest.runAllTimers();

      // TODO: findDOMNode
      // expect(ReactDOM.findDOMNode).not.toHaveBeenCalled();
    });

    it('calls findDOMNode when refs are forwarded but not assigned', () => {
      // let domRef = React.createRef();
      let domRef = null;
      const Div = () => <div />;

      render(() =>
        <CSSMotion motionName="transition" visible ref={domRef}>
          {() => <Div />}
        </CSSMotion>,
      );


      jest.runAllTimers();

      // TODO: findDOMNode
      // expect(ReactDOM.findDOMNode).toHaveBeenCalled();
    });

    it('does not call findDOMNode when refs are forwarded and assigned', () => {
      // let domRef = React.createRef();
      let domRef = null;
      render(() =>
        <CSSMotion motionName="transition" visible ref={domRef}>
          {(props, ref) => <div ref={ref} />}
        </CSSMotion>,
      );


      jest.runAllTimers();


      // expect(ReactDOM.findDOMNode).not.toHaveBeenCalled();
    });
  });

  describe('onVisibleChanged', () => {
    it('visible', () => {
      const onVisibleChanged = jest.fn();

      const { unmount } = render(() =>
        <CSSMotion
          motionName="transition"
          motionAppear={false}
          motionEnter={false}
          motionLeave={false}
          visible
          onVisibleChanged={onVisibleChanged}
        >
          {({ style, className }) => (
            <div
              style={style}
              class={classNames('motion-box', className)}
            />
          )}
        </CSSMotion>,
      );

      expect(onVisibleChanged).toHaveBeenCalled();

      unmount();
    });

    it('!visible', () => {
      const onVisibleChanged = jest.fn();

      const { unmount } = render(() =>
        <CSSMotion
          motionName="transition"
          motionAppear={false}
          motionEnter={false}
          motionLeave={false}
          visible={false}
          onVisibleChanged={onVisibleChanged}
        >
          {({ style, className }) => (
            <div
              style={style}
              class={classNames('motion-box', className)}
            />
          )}
        </CSSMotion>,
      );

      expect(onVisibleChanged).not.toHaveBeenCalled();

      unmount();
    });

    it('fast visible to !visible', () => {
      const onVisibleChanged = jest.fn();

      const Demo_ = ({ visible }: { visible: boolean }) => (
        <CSSMotion
          motionName="transition"
          motionAppear
          motionEnter
          motionLeave
          visible={visible}
          onVisibleChanged={onVisibleChanged}
        >
          {({ style, className }) => (
            <div
              style={style}
              class={classNames('motion-box', className)}
            />
          )}
        </CSSMotion>
      );
      const Demo = wrapFC(Demo_)

      const { unmount, container } = render(() => <Demo visible />);
      // rerender(() => <Demo visible={false} />);
      Demo.setProps({ visible: false })

      jest.runAllTimers();


      fireEvent.animationEnd(container.querySelector('.motion-box'));

      expect(onVisibleChanged).toHaveBeenCalledTimes(1);
      expect(onVisibleChanged).toHaveBeenCalledWith(false);

      unmount();
    });
  });
});
