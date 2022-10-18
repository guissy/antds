/* @refresh reload */
import { render } from 'solid-js/web';
// TODO: solid Draggable
// import Draggable from '../docs/examples/draggable';
// import AntDesign from '../docs/examples/ant-design';
// import MultiplePortal from '../docs/examples/multiple-Portal';
import Pure from '../docs/examples/pure';
import Bootstrap from '../docs/examples/bootstrap';
import { createSignal } from 'solid-js';
import Dialog from './Dialog';

const App = (props) => {
    const [open, setOpen] = createSignal(true);
    const [autoDestroy, setAutoDestroy] = createSignal(false);
    const afterClose = () => {console.log('afterClose')}
    setTimeout(() => {
        // setOpen(false)
    }, 500)
    return <>
        {/* <button onClick={() => setOpen(b => !b)}>open = {String(open())}</button>
        <button onClick={() => setAutoDestroy(b => !b)}>autoDestroy = {String(autoDestroy())}</button>
        <Dialog afterClose={afterClose} visible={open()}></Dialog>
        <Dialog visible width={1128} /> */}
        {/* <AntDesign /> */}
        <Pure />
        <Bootstrap />
        <MultiplePortal />
    </>
}
render(() => <App />, document.getElementById('root') as HTMLElement);


