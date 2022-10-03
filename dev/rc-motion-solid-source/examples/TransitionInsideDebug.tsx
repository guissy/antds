import { type Component, createSignal } from 'solid-js';
import CSSMotion from '../src';
import './TransitionInsideDebug.less';

export default function TransitionInsideDebug() {
  const [visible, setVisible] = createSignal(true);
  return (
    <>
      <button onClick={() => setVisible(true)} type="button">
        visible = true
      </button>
      <button onClick={() => setVisible(false)} type="button">
        visible = false
      </button>
      <p>{String(visible())}</p>
      <CSSMotion
        visible={visible()}
        motionName="debug-transition"
        onEnterStart={() => ({
          'max-height': 0,
        })}
        onEnterActive={() => ({
          'max-height': '200px',
        })}
        onLeaveStart={() => ({
          'max-height': '200px',
        })}
        onLeaveActive={() => ({
          'max-height': 0,
        })}
      >
        {(props: { className, style }) => (
          <div
            class={props.className}
            style={{
              width: '200px',
              height: '200px',
              background: 'green',
              ...props.style,
            }}
          >
            <div class="inner-block">Hover when closing</div>
          </div>
        )}
      </CSSMotion>
    </>
  );
}
