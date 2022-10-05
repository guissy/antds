/* eslint no-console:0 */

import { type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children } from "solid-js";
import { createStore } from "solid-js/store";
import Trigger from '../../src/index';
import '../../assets/index.less';

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

function getPopupContainer(trigger) {
  return trigger.parentNode;
}

const InnerTarget = (props) => (
  <div
    style={{
      margin: 20,
      display: 'inline-block',
      background: 'rgba(255, 0, 0, 0.05)',
    }}
    tabIndex={0}
    role="button"
    {...props}
  >
    <p>This is a example of trigger usage.</p>
    <p>You can adjust the value above</p>
    <p>which will also change the behaviour of popup.</p>
  </div>
);

const RefTarget = (props) => {
  // props.ref = {};
  return <InnerTarget {...props} />;
};

interface TestState {
  mask: boolean;
  maskClosable: boolean;
  placement: 'right';
  trigger: {
    click?: boolean;
    focus?: boolean;
    hover?: boolean;
    contextMenu?: boolean;
  };
  offsetX: number;
  offsetY: number;
  stretch: string;
  transitionName: string;
  destroyed?: boolean;
  destroyPopupOnHide?: boolean;
  autoDestroy?: boolean;
  mobile?: boolean;
}

const Test: Component = () => {
  const [state, setState] = createStore<TestState>({
    mask: true,
    maskClosable: true,
    placement: 'right',
    trigger: {
      click: true,
    },
    offsetX: undefined,
    offsetY: undefined,
    stretch: '',
    transitionName: 'rc-trigger-popup-zoom',
  });

  const onPlacementChange = (e) => {
    setState({
      placement: e.target.value,
    });
  };

  const onStretch = (e) => {
    setState({
      stretch: e.target.value,
    });
  };

  const onTransitionChange = (e) => {
    setState({
      transitionName: e.target.checked ? e.target.value : '',
    });
  };

  const onTriggerChange = ({ target: { checked, value } }) => {
    setState(({ trigger }) => {
      const clone = { ...trigger };

      if (checked) {
        clone[value] = 1;
      } else {
        delete clone[value];
      }

      return {
        trigger: clone,
      };
    });
  };

  const onOffsetXChange = (e) => {
    const targetValue = e.target.value;
    setState({
      offsetX: targetValue || undefined,
    });
  };

  const onOffsetYChange = (e) => {
    const targetValue = e.target.value;
    setState({
      offsetY: targetValue || undefined,
    });
  };

  const onVisibleChange = (visible) => {
    console.log('tooltip', visible);
  };

  const onMask = (e) => {
    setState({
      mask: e.target.checked,
    });
  };

  const onMaskClosable = (e) => {
    setState({
      maskClosable: e.target.checked,
    });
  };

  const getPopupAlign = () => {
    const { offsetX, offsetY } = state;
    return {
      offset: [offsetX, offsetY],
      overflow: {
        adjustX: 1,
        adjustY: 1,
      },
    };
  };

  const destroy = () => {
    setState({
      destroyed: true,
    });
  };

  const destroyPopupOnHide = (e) => {
    setState({
      destroyPopupOnHide: e.target.checked,
    });
  };

  const autoDestroy = (e) => {
    setState({
      autoDestroy: e.target.checked,
    });
  };

  // render() {
  // const { state } = this;
  const { trigger } = state;
  if (state.destroyed) {
    return null;
  }
  return (
    <div>
      <div style={{ margin: '10px 20px' }}>
        <label>
          placement:
          <select value={state.placement} onChange={onPlacementChange}>
            <option>right</option>
            <option>left</option>
            <option>top</option>
            <option>bottom</option>
            <option>topLeft</option>
            <option>topRight</option>
            <option>bottomRight</option>
            <option>bottomLeft</option>
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          Stretch:
          <select value={state.stretch} onChange={onStretch}>
            <option value="">--NONE--</option>
            <option value="width">width</option>
            <option value="minWidth">minWidth</option>
            <option value="height">height</option>
            <option value="minHeight">minHeight</option>
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            value="rc-trigger-popup-zoom"
            type="checkbox"
            onChange={onTransitionChange}
            checked={state.transitionName === 'rc-trigger-popup-zoom'}
          />
          transitionName
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp; trigger:
        <label>
          <input
            value="hover"
            checked={!!trigger.hover}
            type="checkbox"
            onChange={onTriggerChange}
          />
          hover
        </label>
        <label>
          <input
            value="focus"
            checked={!!trigger.focus}
            type="checkbox"
            onChange={onTriggerChange}
          />
          focus
        </label>
        <label>
          <input
            value="click"
            checked={!!trigger.click}
            type="checkbox"
            onChange={onTriggerChange}
          />
          click
        </label>
        <label>
          <input
            value="contextMenu"
            checked={!!trigger.contextMenu}
            type="checkbox"
            onChange={onTriggerChange}
          />
          contextMenu
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!state.destroyPopupOnHide}
            type="checkbox"
            onChange={destroyPopupOnHide}
          />
          destroyPopupOnHide
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!state.autoDestroy}
            type="checkbox"
            onChange={autoDestroy}
          />
          autoDestroy
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!state.mask}
            type="checkbox"
            onChange={onMask}
          />
          mask
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!state.maskClosable}
            type="checkbox"
            onChange={onMaskClosable}
          />
          maskClosable
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            checked={!!state.mobile}
            type="checkbox"
            onChange={() => {
              setState(({ mobile }) => ({
                mobile: !mobile,
              }));
            }}
          />
          mobile
        </label>
        <br />
        <label>
          offsetX:
          <input
            type="text"
            onChange={onOffsetXChange}
            style={{ width: '50px' }}
          />
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          offsetY:
          <input
            type="text"
            onChange={onOffsetYChange}
            style={{ width: '50px' }}
          />
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button type="button" onClick={destroy}>
          destroy
        </button>
      </div>
      <div style={{ margin: '120px', position: 'relative' }}>
        <Trigger
          getPopupContainer={getPopupContainer}
          popupAlign={getPopupAlign()}
          popupPlacement={state.placement}
          destroyPopupOnHide={state.destroyPopupOnHide}
          autoDestroy={state.autoDestroy}
          // zIndex={40}
          mask={state.mask}
          maskClosable={state.maskClosable}
          stretch={state.stretch}
          maskAnimation="fade"
          // mouseEnterDelay={0.1}
          // mouseLeaveDelay={0.1}
          action={Object.keys(state.trigger)}
          builtinPlacements={builtinPlacements}
          popupStyle={{
            border: '1px solid red',
            padding: '10px',
            background: 'white',
            'box-sizing': 'border-box',
          }}
          popup={<div>i am a popup</div>}
          popupTransitionName={state.transitionName}
          mobile={
            state.mobile
              ? {
                popupMotion: {
                  motionName: 'rc-trigger-popup-mobile-fade',
                },
                popupClassName: 'rc-trigger-popup-mobile',
                popupStyle: {
                  padding: '16px',
                  'border-top': '1px solid red',
                  background: '#FFF',
                  'text-align': 'center',
                },
                popupRender: (node) => (
                  <>
                    <div>
                      <input
                        style={{ width: '100%' }}
                        placeholder="additional content"
                      />
                    </div>
                    {node}
                  </>
                ),
              }
              : null
          }
        >
          <RefTarget />
        </Trigger>
      </div>
    </div>
  );

}

export default Test;
