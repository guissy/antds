/* eslint no-console:0 */

import Trigger from '../../src';
import '../../assets/index.less';
import './point.less';
import { createStore } from 'solid-js/store';
import { Component } from 'solid-js';

const builtinPlacements = {
  topLeft: {
    points: ['tl', 'tl'],
  },
};

const innerTrigger = (
  <div style={{ padding: '20px', background: 'rgba(0, 255, 0, 0.3)' }}>This is popup</div>
);

const Test: Component = () => {
  const [state, setState] = createStore({
    action: 'click',
    mouseEnterDelay: 0,
  });

  const onActionChange = ({ target: { value } }) => {
    setState({ action: value });
  };

  const onDelayChange = ({ target: { value } }) => {
    setState({ mouseEnterDelay: Number(value) || 0 });
  };


  // const { action, mouseEnterDelay } = this.state;

  return (
    <div>
      <label>
        Trigger type:{' '}
        <select value={state.action} onChange={onActionChange}>
          <option>click</option>
          <option>hover</option>
          <option>contextMenu</option>
        </select>
      </label>{' '}
      {state.action === 'hover' && (
        <label>
          Mouse enter delay:{' '}
          <input type="text" value={state.mouseEnterDelay} onChange={onDelayChange} />
        </label>
      )}
      <div style={{ margin: '50px' }}>
        <Trigger
          popupPlacement="topLeft"
          action={[state.action]}
          popupAlign={{
            overflow: {
              adjustX: 1,
              adjustY: 1,
            },
          }}
          mouseEnterDelay={state.mouseEnterDelay}
          popupClassName="point-popup"
          builtinPlacements={builtinPlacements}
          popup={innerTrigger}
          alignPoint
        >
          <div
            style={{
              border: '1px solid red',
              padding: '100px 0',
              'text-align': 'center',
            }}
          >
            Interactive region
          </div>
        </Trigger>
      </div>
    </div>
  );
}

export default Test;
