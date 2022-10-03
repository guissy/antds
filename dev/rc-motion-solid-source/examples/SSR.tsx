import { type Component, createSignal, onCleanup, onMount, Show, createEffect } from 'solid-js';
import classNames from 'classnames';
import { genCSSMotion } from '../src/CSSMotion';
import CSSMotion from '../src';
import './CSSMotion.less';
import { renderToString, hydrate } from 'solid-js/web';

const ServerCSSMotion = genCSSMotion(false);

const onCollapse = () => ({ height: 0 });

interface MotionAppearProps {
  supportMotion: boolean;
}

const MotionAppear = (props: MotionAppearProps) => {
  const Component = props.supportMotion ? CSSMotion : ServerCSSMotion;

  return (
    <Component
      motionName="transition"
      leavedClassName="hidden"
      motionAppear
      onAppearStart={onCollapse}
    >
      {(props: { style, className }) => (
        <div
          class={classNames('demo-block', props.className)}
          style={props.style}
        />
      )}
    </Component>
  );
};

const Demo = () => {
  const ssr = renderToString(() =>
    <MotionAppear supportMotion={false} />,
  );
  console.log(ssr)
  createEffect(() => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    div.innerHTML = ssr;

    hydrate(() => <MotionAppear supportMotion />, div);
    // const body = renderToString(() => <MotionAppear supportMotion />);

    return () => {
      document.body.removeChild(div);
    };
  }, []);

  return (
    <div>
      <textarea value={ssr} style={{ width: '100%' }} rows={5} readOnly />
    </div>
  );
};

export default Demo;
