import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children} from "solid-js";
import { render, fireEvent } from "solid-testing-library";
import Portal from '../src';

describe('SSR', () => {
  it.skip('No Render in SSR', () => {
    render(() => 
      <Portal open>
        <div class="bamboo">Hello World</div>
      </Portal>,
    { hydrate: true });
  });
});
