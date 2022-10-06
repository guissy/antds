import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import Tooltip from '../../src';
import '../../assets/bootstrap.less';
import { createStore } from "solid-js/store";

function preventDefault(e) {
  e.preventDefault();
}

const Test: Component = () => {
  const [state, setState] = createStore({
    visible: false,
    destroy: false,
  });

  const onVisibleChange = visible => {
    setState({
      visible,
    });
  };

  const onDestroy = () => {
    setState({
      destroy: true,
    });
  };


  if (state.destroy) {
    return null;
  }
  return (
    <div>
        <div style={{ 'margin-top': '100px', 'margin-left': '100px', 'margin-bottom': '100px' }}>
        <Tooltip
          visible={state.visible}
          animation="zoom"
          onVisibleChange={onVisibleChange}
          trigger="click"
          overlay={<span>I am a tooltip</span>}
        >
          <a href="#" onClick={preventDefault}>
            trigger
          </a>
        </Tooltip>
      </div>
      <button type="button" onClick={onDestroy}>
        destroy
      </button>
    </div>
  );

}

export default Test;
