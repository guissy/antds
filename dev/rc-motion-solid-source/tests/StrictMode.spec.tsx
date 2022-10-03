/* eslint-disable
  react/no-render-return-value, max-classes-per-file,
  react/prefer-stateless-function, react/no-multi-comp
*/
import { render, fireEvent } from "solid-testing-library";
import classNames from 'classnames';
// import type { CSSMotionProps } from '../src/CSSMotion';
import { genCSSMotion } from '../src/CSSMotion';
// import RefCSSMotion, { genCSSMotion } from '../src/CSSMotion';
//

describe('StrictMode', () => {
  const CSSMotion = genCSSMotion({
    transitionSupport: true,
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('motion should end', () => {
    const ref = null;

    const { container } = render(() => (
      <CSSMotion
        motionName="transition"
        ref={ref}
        motionAppear
        visible
        removeOnLeave={false}
      >
        {(props: { style; className }) => {
          return (
            <div
              style={props.style}
              class={classNames('motion-box', props.className)}
            />
          );
        }}
      </CSSMotion>
    ));

    const node = container.querySelector('.motion-box');
    expect(node).toHaveClass('transition-appear', 'transition-appear-start');

    // Active

    jest.runAllTimers();

    expect(node).not.toHaveClass('transition-appear-start');
    expect(node).toHaveClass('transition-appear-active');

    // Trigger End
    fireEvent.transitionEnd(node);
    expect(node).not.toHaveClass('transition-appear');

    expect(ref).toBe(node);
  });
});
