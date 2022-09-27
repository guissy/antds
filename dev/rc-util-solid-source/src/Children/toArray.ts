import { type JSX, children as Children} from "solid-js";
// import { isFragment } from 'react-is';

export interface Option {
  keepEmpty?: boolean;
}

export default function toArray(
  children: JSX.Element,
  option: Option = {},
): HTMLElement[] {
  let ret: HTMLElement[] = [];
  const resolved = Children(() => children).toArray();
  resolved.forEach((child: any | any[]) => {
    if ((child === undefined || child === null) && !option.keepEmpty) {
      return;
    }

    if (Array.isArray(child)) {
      ret = ret.concat(toArray(child));
    } else {
      ret.push(child);
    }
  });

  return ret;
}
