/* @refresh reload */
import { render } from 'solid-js/web';
import Basic from '../examples/basic';
import Collection from '../examples/collection';
import Debug from '../examples/debug';
import RenderProps from '../examples/renderProps';
render(() => <>
<Debug />
<RenderProps />
{/* <Basic />
<Collection /> */}
</>, document.getElementById('root') as HTMLElement);
