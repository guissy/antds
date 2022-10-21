/* @refresh reload */
import { render } from 'solid-js/web';
import Simple from '../docs/examples/simple';
import Multiple from '../docs/examples/multiple';
import Arrow from '../docs/examples/arrow';
import ContextMenu from '../docs/examples/context-menu';
import DropdownMenuWidth from '../docs/examples/dropdown-menu-width';
import OverflowCallback from '../docs/examples/overlay-callback';

const App = (props) => {
    setTimeout(() => {
        // setOpen(false)
    }, 500)
    return <>
        <Simple />
        {/* <OverflowCallback /> */}
        {/* <DropdownMenuWidth /> */}
        {/* <ContextMenu /> */}
        {/* <Arrow /> */}
        {/* <Multiple /> */}
    </>
}
render(() => <App />, document.getElementById('root') as HTMLElement);


