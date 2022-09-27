import { createEffect } from "solid-js";
import { render, screen } from "solid-testing-library";
import toArray from '../src/Children/toArray';

describe('toArray', () => {
  let propsChildren;
  const UL = (props) => {
    createEffect(() => {
      propsChildren = props.children;
    })
    return <ul>{props.children}</ul>
  };

  it('basic', () => {
    let ulRef = null;

    render(() => 
      <UL ref={ulRef}>
        <li id="key1">1</li>
        <li id="key2">2</li>
        <li id="key3">3</li>
      </UL>,
    );

    const children = toArray(propsChildren);
    expect(children).toHaveLength(3);
    expect(children.map(c => c.id)).toEqual(['key1', 'key2', 'key3']);
  });

  it('Array', () => {
    let ulRef = null;

    render(() => 
      <UL ref={ulRef}>
        <li data-key="key1">1</li>
        {[<li data-key="key2">2</li>, <li data-key="key3">3</li>]}
      </UL>,
    );

    const children = toArray(propsChildren) as HTMLElement[];
    expect(children).toHaveLength(3);
    expect(children.map(c => c.dataset.key)).toEqual(['key1', 'key2', 'key3']);
  });

  it('Fragment', () => {
    let ulRef = null;

    render(() => 
      <UL ref={ulRef}>
        <li data-key="1">1</li>
        <>
          <li data-key="2">2</li>
          <li data-key="3">3</li>
        </>
        <>
          <>
            <li data-key="4">4</li>
            <li data-key="5">5</li>
          </>
        </>
      </UL>,
    );

    const children = toArray(propsChildren) as HTMLElement[];
    expect(children).toHaveLength(5);
    expect(children.map(c => c.dataset.key)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('keep empty', () => {
    let ulRef = null;

    render(() => 
      <UL ref={ulRef}>
        {null}
        <li data-key="1">1</li>
        <>
          <li data-key="2">2</li>
          {null}
          <li data-key="3">3</li>
        </>
        <>
          <>
            <li data-key="4">4</li>
            {undefined}
            <li data-key="5">5</li>
          </>
        </>
        {undefined}
      </UL>,
    );

    const children = toArray(propsChildren, { keepEmpty: true }) as HTMLElement[];
    expect(children).toHaveLength(9);
    expect(children.map(c => c && c.dataset.key)).toEqual([
      null,
      '1',
      '2',
      null,
      '3',
      '4',
      undefined,
      '5',
      undefined,
    ]);
  });
});
