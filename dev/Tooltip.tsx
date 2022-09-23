import { ParentComponent, JSX, createSignal, children as Children } from "solid-js";
import { spread } from "solid-js/web";

export const Tooltip: ParentComponent<{onVisibleChange?: (visible: boolean) => void}> = (props) => {
    const child = Children(() => props.children)() as Node;
    spread(child, {
        onMouseEnter: () => props.onVisibleChange(true),
        onMouseLeave: () => props.onVisibleChange(false),
    });
    return <div>{child}</div>
}
