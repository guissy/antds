import {type Component, type JSX } from "solid-js";

export interface DomWrapperProps {
  children: JSX.Element;
}

const DomWrapper: Component<DomWrapperProps> = (props) => {
    return props.children;
}

export default DomWrapper;
