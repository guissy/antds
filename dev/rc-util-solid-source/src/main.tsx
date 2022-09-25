/* @refresh reload */
import { render } from 'solid-js/web';

import Portal from "./Portal";

render(() => <Portal visible>Portal</Portal>, document.getElementById('root') as HTMLElement);
