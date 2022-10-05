import { render, fireEvent, screen } from "solid-testing-library";
import Trigger from '../src';
import { placementAlignMap } from './util';

describe('Trigger.Mask', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('mask should support motion', () => {
    // const cssMotionSpy = jest.spyOn(CSSMotion, 'render');
    const { container } = render(() => 
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong class="x-content" />}
        mask
        maskTransitionName="bamboo"
      >
        <div class="target">click</div>
      </Trigger>,
    );

    const target = container.querySelector('.target');
    fireEvent.click(target);
    expect(document.querySelector(".bamboo")).toBeTruthy();
    // expect(cssMotionSpy).toHaveBeenCalledWith(
    //   expect.objectContaining({ motionName: 'bamboo' }),
    //   null,
    // );
  });
});
