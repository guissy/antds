import { type Component, createSignal } from 'solid-js';
import classNames from 'classnames';
import CSSMotion from '../src';
import './CSSMotion.less';


const Demo: Component = () => {
  // state = {
  //   show: true,
  // };
  const [show, setShow] = createSignal(true);

  const onTrigger = () => {
    setShow((show) => !show);
  };

  const onStart = (ele: HTMLElement, event: object) => {
    console.log('start!', ele, event);
  };

  const onEnd = (ele: HTMLElement, event: object) => {
    console.log('end!', ele, event);
  };


  return (
    <div>
      <label>
        <input type="checkbox" onChange={onTrigger} checked={show} />{' '}
        Show Component
      </label>

      <div class="grid">
        <div>
          <h2>With Transition Class</h2>
          <CSSMotion
            visible={show()}
            motionName="no-trigger"
            motionDeadline={1000}
            removeOnLeave
            onAppearStart={onStart}
            onEnterStart={onStart}
            onLeaveStart={onStart}
            onAppearEnd={onEnd}
            onEnterEnd={onEnd}
            onLeaveEnd={onEnd}
          >
            {(props: { style, className }) => (
              <div
                class={classNames('demo-block', props.className)}
                style={props.style}
              />
            )}
          </CSSMotion>
        </div>
      </div>
    </div>
  );
}

export default Demo;
