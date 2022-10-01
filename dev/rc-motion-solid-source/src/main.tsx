/* @refresh reload */
import { render } from 'solid-js/web';

// import React from 'react';
import classNames from 'classnames';
import CSSMotion from './CSSMotion';
import '../examples/CSSMotion.less';
import { createSignal, onCleanup, onMount } from 'solid-js';

interface DemoState {
  show: boolean;
  forceRender: boolean;
  motionLeaveImmediately: boolean;
  removeOnLeave: boolean;
  hasMotionClassName: boolean;
  prepare: boolean;
}

async function forceDelay(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 2000);
  });
}

const Div = ((props) => {
    onMount(() => {
        console.log('DIV >>> Mounted!');
    })
    onCleanup(() => {
        console.log('DIV >>> UnMounted!');
    })

  return <div {...props} ref={props.ref} />;
});

const Demo: Component = () => {
  const state1: DemoState = {
    show: true,
    forceRender: false,
    motionLeaveImmediately: false,
    removeOnLeave: true,
    hasMotionClassName: true,
    prepare: false,
  };
    const [state, setState] = createSignal(state1);

  const onTrigger = () => {
    setTimeout(() => {
      setState(({ show, ...p }) => ({ ...p, show: !show }));
    }, 100);
  };

  const onTriggerDelay = () => {
    setState(({ prepare, ...p }) => ({ ...p,  prepare: !prepare }));
  };

  const onForceRender = () => {
    setState(({ forceRender, ...p }) => ({ ...p,  forceRender: !forceRender }));
  };

  const onRemoveOnLeave = () => {
    setState(({ removeOnLeave, ...p }) => ({ ...p, removeOnLeave: !removeOnLeave }));
  };

  const onTriggerClassName = () => {
    setState(({ hasMotionClassName, ...p }) => ({ ...p, hasMotionClassName: !hasMotionClassName,}));
  };

  const onCollapse = () => {
    return { height: 0 };
  };

  const onMotionLeaveImmediately = () => {
    setState(({ motionLeaveImmediately, ...p }) => ({ ...p, motionLeaveImmediately: !motionLeaveImmediately,}));
  };

  const skipColorTransition = (_, event) => {
    // CSSMotion support multiple transition.
    // You can return false to prevent motion end when fast transition finished.
    if (event.propertyName === 'background-color') {
      return false;
    }
    return true;
  };

  const styleGreen = () => ({
    background: 'green',
  });

//   render() {
    // const {
    //   show,
    //   forceRender,
    //   motionLeaveImmediately,
    //   removeOnLeave,
    //   hasMotionClassName,
    //   prepare,
    // } = state;

    return (
      <div>
        <label>
          <input type="checkbox" onChange={onTrigger} checked={state().show} />{' '}
          Show Component
        </label>

        <label>
          <input
            type="checkbox"
            onChange={onTriggerClassName}
            checked={state().hasMotionClassName}
          />{' '}
          hasMotionClassName
        </label>

        <label>
          <input
            type="checkbox"
            onChange={onForceRender}
            checked={state().forceRender}
          />{' '}
          forceRender
        </label>

        <label>
          <input
            type="checkbox"
            onChange={onRemoveOnLeave}
            checked={state().removeOnLeave}
          />{' '}
          removeOnLeave
          {state().removeOnLeave ? '' : ' (use leavedClassName)'}
        </label>

        <label>
          <input
            type="checkbox"
            onChange={onTriggerDelay}
            checked={state().prepare}
          />{' '}
          prepare before motion
        </label>

        <div class="grid">
          <div>
            <h2>With Transition Class</h2>
            <CSSMotion
              visible={state().show}
              forceRender={state().forceRender}
              motionName={state().hasMotionClassName ? 'transition' : null}
              removeOnLeave={state().removeOnLeave}
              leavedClassName="hidden"
              onAppearPrepare={state().prepare && forceDelay}
              onEnterPrepare={state().prepare && forceDelay}
              onAppearStart={onCollapse}
              onEnterStart={onCollapse}
              onLeaveActive={onCollapse}
              onEnterEnd={skipColorTransition}
              onLeaveEnd={skipColorTransition}
              onVisibleChanged={visible => {
                console.log('Visible Changed:', visible);
              }}
            >
              {(props, ref) => (
                <Div
                  ref={ref}
                  class={classNames('demo-block', props.className)}
                  style={props.style}
                />
              )}
            </CSSMotion>
          </div>

          <div>
            <h2>With Animation Class</h2>
            <CSSMotion
              visible={state().show}
              forceRender={state().forceRender}
              motionName={state().hasMotionClassName ? 'animation' : null}
              removeOnLeave={state().removeOnLeave}
              leavedClassName="hidden"
              onLeaveActive={styleGreen}
            >
              {({ style, className }) => (
                <div
                  class={classNames('demo-block', className)}
                  style={style}
                />
              )}
            </CSSMotion>
          </div>
        </div>

        <div>
          <button type="button" onClick={onMotionLeaveImmediately}>
            motionLeaveImmediately
          </button>

          <div>
            {state().motionLeaveImmediately && (
              <CSSMotion
                visible={false}
                motionName={state().hasMotionClassName ? 'transition' : null}
                removeOnLeave={state().removeOnLeave}
                leavedClassName="hidden"
                onLeaveActive={onCollapse}
                motionLeaveImmediately
                onLeaveEnd={skipColorTransition}
              >
                {({ style, className }) => (
                  <div
                    class={classNames('demo-block', className)}
                    style={style}
                  />
                )}
              </CSSMotion>
            )}
          </div>
        </div>
      </div>
    );
}


render(() => <Demo />, document.getElementById('root') as HTMLElement);
