import classNames from 'classnames';
import { createSignal, onMount, type Component } from 'solid-js';
import { CSSMotionList } from '../src';
import './CSSMotionList.less';

const CSSMomtionList: Component = (props) => {
  const [state, setState] = createSignal({
    count: 1,
    checkedMap: {},
    keyList: [],
  });

  const onFlushMotion = () => {
    const { count, checkedMap } = state();
    let keyList = [];
    for (let i = 0; i < count; i += 1) {
      if (checkedMap[i] !== false) {
        keyList.push(i);
      }
    }

    keyList = keyList.map(key => {
      if (key === 3) {
        return { key, background: 'orange' };
      }
      return key;
    });

    setState((p) => ({ ...p, keyList }));
  };

  onMount(() => {
    onFlushMotion();
  })

  const onCountChange = ({ target: { value } }) => {
    setState((p) => ({ ...p, count: Number(value) }));
  };

  // Motion
  const onCollapse = () => ({ width: 0, margin: '0 -5px 0 0' });

  // render() {
  // const { count, checkedMap, keyList } = this.state;

  return (
    <div>
      key 3 is a different component with others.
      {/* Input field */}
      <div>
        <label>
          node count
          <input type="number" value={state().count} onChange={onCountChange} />
        </label>
        <button type="button" onClick={onFlushMotion}>
          Flush Motion
        </button>
      </div>
      {/* Motion State */}
      <div>
        {Array.from(Array(state().count).keys()).map((_, key) => {
          const checked = state().checkedMap[key] !== false;
          return (
            <label data-key={key}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  setState(p => ({
                    ...p,
                    checkedMap: {
                      ...state().checkedMap,
                      [key]: !checked,
                    },
                  }));
                }}
              />
              {key}
            </label>
          );
        })}
      </div>
      {/* Motion List */}
      <CSSMotionList
        keys={state().keyList}
        motionName="transition"
        onAppearStart={onCollapse}
        onEnterStart={onCollapse}
        onLeaveActive={onCollapse}
        onVisibleChanged={(changedVisible, info) => {
          console.log('Visible Changed >>>', changedVisible, info);
        }}
      >
        {(props: { key, background, className, style }) => {
          return (
            <div
              data-time={new Date().toLocaleTimeString()}
              class={classNames('demo-block', props?.className)}
              style={{
                ...props?.style,
                background: props?.background,
              }}
            >
              <span>{props?.key}</span>
            </div>
          );
        }}
      </CSSMotionList>
    </div>
  );

}

export default CSSMomtionList;