/* eslint-disable react/button-has-type,react/no-render-return-value */
import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { render, fireEvent } from "solid-testing-library";
import Dropdown from '../src';
import placements from '../src/placements';
import { sleep, getPopupDomNode } from './utils';

describe('point', () => {
  it('click show', async () => {
    const overlay = (
      <div
        class="check-for-visible"
        style={{
          width: '10px',
        }}
      >
        Test
      </div>
    );

    const dropdown = render(() => 
      <Dropdown
        trigger={['contextMenu']}
        overlay={overlay}
        alignPoint
        align={{
          points: ['tl'],
          overflow: {},
        }}
      >
        <button class="my-button">open</button>
      </Dropdown>,
    );

    const pageStyle = {
      pageX: 9,
      pageY: 3,
    };

    fireEvent.contextMenu(dropdown.container.querySelector('.my-button'), pageStyle);

    await sleep(500);

    expect(getPopupDomNode(dropdown).getAttribute('style')).toEqual(
      expect.stringContaining(
        `left: -${999 - pageStyle.pageX - placements.bottomLeft.offset[0]}px; top: -${999 -
          pageStyle.pageY -
          placements.bottomLeft.offset[1]}px;`,
      ),
    );
  });
});
