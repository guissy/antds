/* @refresh reload */
import { render } from 'solid-js/web';

import Basic from '../examples/basic';
import Blink from '../examples/blink';
import FillWidth from '../examples/fill-width';
import RawRender from '../examples/raw-render';


render(() => <main>
    <RawRender />
    {/* <FillWidth /> */}
    <Basic />
    <Blink />
</main>, document.getElementById('root') as HTMLElement);
