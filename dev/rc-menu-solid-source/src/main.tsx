/* @refresh reload */
import { render } from 'solid-js/web';
import Menu from './index';
import Simple from '../docs/examples/debug.tsx';
import "../assets/menu.less"
import "../assets/index.less"

const App = () => {
    const [active, setAcitve] = createSignal(false);
    return <>
<Menu mode="inline">
        <Menu.Item key="light">Light</Menu.Item>
        <Menu.SubMenu key="bamboo" title="Bamboo">
          <Menu.Item key="little">Little</Menu.Item>
        </Menu.SubMenu>
      </Menu>
        {String(active())}
    </>
}
render(() => App, document.getElementById('root') as HTMLElement);

import toArray from 'rc-util-solid/lib/Children/toArray';

import { Show, For } from 'solid-js/web';
import {
    createSignal,
    createContext,
    useContext,
    createMemo,
    mergeProps,
    onMount,
    children as Children,
    Index,
    createEffect,
    Suspense,
    splitProps,
    onCleanup,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import MenuContextProvider, { MenuContext } from './context/MenuContext';

// const MenuContext = createContext({ name: 'init' });

function mergeProps2(
    origin,
    target,
) {
    const clone = { ...origin };

    Object.keys(target).forEach(key => {
        const value = target[key];
        if (value !== undefined) {
            clone[key] = value;
        }
    });

    return clone;
}

// function MenuContextProvider(props) {
//     const context = useContext(MenuContext);
//     const [state, setState] = createStore({});
//     createMemo(() => {
//         setState(mergeProps2(context, splitProps(props, ['children'])[1]));
//         console.log("provider", {...props}, { ...state });
//     });
//     return (
//         <MenuContext.Provider value={state}>
//             <Show when={true}>{props.children}</Show>
//         </MenuContext.Provider>
//     );
// }
const Parent = props => {
    let context = useContext(MenuContext);
    onCleanup(() => {
        // context = useContext(MenuContext);
        console.count("mount Parent")
    })
    createEffect(() => {
        console.log('context Parent', { ...context })
    })
    return <div> {props.children} </div>;
};

const Item = props => {
    let context = useContext(MenuContext);
    onCleanup(() => {
        // context = useContext(MenuContext);
        console.count("mount")
    })
    createEffect(() => {
        console.log('context', { ...context })
    })
    return <div>item {props.label} {JSON.stringify(context)} </div>;
};

const Menu1 = props => {
    // const resolved = Children(() => props.children);
    // console.log(props.children?.length)
    // const childList = toArray(props.children);
    // console.log(Array.isArray(childList), "⇨ ⇨ ⇨ ⇨ ⇨ ⇨", Array.from(childList.keys()))
    //   const toArray(props.children).keys();
    onMount(() => {
        console.count('menu')
    })
    let index = 1;
    return (
        <>
            <MenuContextProvider name={"menu ha"}>
                <For each={toArray(props.children)}>
                    {((it, index) => (
                        <Parent>
                            <MenuContextProvider
                                key={'menu' + index}
                                overflowDisabled={index > 3}
                            >
                                {/* <Item /> */}
                                {toArray(props.children)[index]}
                            </MenuContextProvider>
                        </Parent>
                    ))}
                </For>
            </MenuContextProvider>
        </>
    );
};

function Counter() {
    const [count, setCount] = createSignal(2);
    const increment = () => setCount(count() + 1);
    console.log(Array.from(Object.keys(Array(count()))));
    const data = () => Array.from(Array(count()).keys())
    return (
        <div>
            <Menu1>
                <For each={data()}>{it => (
                    <Item label={'init' + (it + 1)}>{it}</Item>
                )}</For>
            </Menu1>
            <button type="button" onClick={increment}>
                {count()}
            </button>
        </div>
    );
}

// render(() => <Counter />, document.getElementById('root')!);

