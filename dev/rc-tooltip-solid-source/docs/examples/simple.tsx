import { type Component, type JSX,  createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import Tooltip from '../../src';
import '../../assets/bootstrap.less';
import { placements } from '../../src/placements';

const Test: Component = (props) => {
  const [state, setState] = createStore({
    destroyTooltipOnHide: false as false | { keepParent: boolean; },
    destroyTooltipOptions: [
      {
        name: "don't destroy",
        value: 0,
      },
      {
        name: 'destroy parent',
        value: 1,
      },
      {
        name: 'keep parent',
        value: 2,
      },
    ],
    placement: 'right',
    transitionName: 'rc-tooltip-zoom',
    trigger: {
      hover: true,
      // click: true,
      // focus: true,
    } as { hover?: boolean, click?: boolean, focus?: boolean },
    offsetX: placements.right.offset[0],
    offsetY: placements.right.offset[1],
    overlayInnerStyle: undefined,
    // visible: false
  });

  const onPlacementChange = e => {
    const placement = e.target.value;
    const { offset } = placements[placement];
    setState({
      placement: e.target.value,
      offsetX: offset[0],
      offsetY: offset[1],
    });
  };

  const onTransitionChange = e => {
    setState({
      transitionName: e.target.checked ? e.target.value : '',
    });
  };

  const onTriggerChange = e => {
    // const { trigger } = state;
    let trigger = { ...state.trigger }
    if (e.target.checked) {
      trigger[e.target.value] = true;
    } else {
      delete trigger[e.target.value];
    }
    console.log(trigger)
    setState({
      trigger,
    });
  };

  const onOffsetXChange = e => {
    const targetValue = e.target.value;
    setState({
      offsetX: targetValue || undefined,
    });
  };

  const onOffsetYChange = e => {
    const targetValue = e.target.value;
    setState({
      offsetY: targetValue || undefined,
    });
  };

  const onVisibleChange = visible => {
    console.log('tooltip', visible); // eslint-disable-line no-console
  };

  const onDestroyChange = e => {
    const { value } = e.target;
    setState({
      destroyTooltipOnHide: ([false, { keepParent: false }, { keepParent: true }])[value],
    });
  };

  const onOverlayInnerStyleChange = () => {
    setState(prevState => ({
      overlayInnerStyle: prevState.overlayInnerStyle ? undefined : { background: 'red' },
    }));
  };

  const onVisible = () => {
    setState(prevState => ({
      visible: !prevState.visible
    }));
  };

  const preventDefault = e => {
    e.preventDefault();
  };

  // render() {
  // const { state } = this;
  // const { trigger } = state;
  return (
    <div>
      <div style={{ margin: '10px 20px' }}>
        <label>
          placement:
          <select value={state.placement} onChange={onPlacementChange}>
            {Object.keys(placements).map(p => (
              <option data-key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input
            value="rc-tooltip-zoom"
            type="checkbox"
            onChange={onTransitionChange}
            checked={state.transitionName === 'rc-tooltip-zoom'}
          />
          transitionName
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          destroyTooltipOnHide:
          <select onChange={onDestroyChange}>
            {state.destroyTooltipOptions.map(({ name, value }) => (
              <option data-key={value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp; trigger:
        <label>
          <input
            value="hover"
            checked={state.trigger.hover}
            type="checkbox"
            onChange={onTriggerChange}
          />
          hover
        </label>
        <label>
          <input
            value="focus"
            checked={state.trigger.focus}
            type="checkbox"
            onChange={onTriggerChange}
          />
          focus
        </label>
        <label>
          <input
            value="click"
            checked={state.trigger.click}
            type="checkbox"
            onChange={onTriggerChange}
          />
          click
        </label>
        <br />
        <label>
          offsetX:
          <input
            type="text"
            value={state.offsetX}
            onChange={onOffsetXChange}
            style={{ width: '50px' }}
          />
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          offsetY:
          <input
            type="text"
            value={state.offsetY}
            onChange={onOffsetYChange}
            style={{ width: '50px' }}
          />
        </label>
        <label>
          <input
            value="overlayInnerStyle"
            checked={!!state.overlayInnerStyle}
            type="checkbox"
            onChange={onOverlayInnerStyleChange}
          />
          overlayInnerStyle(red background)
        </label>
        <label>
          <input
            value="visible"
            checked={!!state.visible}
            type="checkbox"
            onChange={onVisible}
          />
          visible
        </label>
      </div>
      <div style={{ margin: '100px' }}>
        <Tooltip
          placement={state.placement}
          mouseEnterDelay={0}
          mouseLeaveDelay={0.1}
          visible={state.visible}
          destroyTooltipOnHide={state.destroyTooltipOnHide}
          trigger={Object.keys(state.trigger)}
          onVisibleChange={onVisibleChange}
          overlay={<div style={{ height: '50px', width: '50px' }}>i am a tooltip</div>}
          align={{
            offset: [state.offsetX, state.offsetY],
          }}
          transitionName={state.transitionName}
          overlayInnerStyle={state.overlayInnerStyle}
        >
          <div style={{ height: '100px', width: '100px', border: '1px solid red' }}>trigger</div>
        </Tooltip>
      </div>
    </div>
  );
}

export default Test;
