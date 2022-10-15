import {type Component, type JSX, createEffect, createSignal, createContext, createMemo, useContext, children as Children, splitProps} from "solid-js";
import toArray from 'rc-util-solid/lib/Children/toArray';
import type { ItemType } from '../interface';
import { Divider, MenuItem, MenuItemGroup, SubMenu } from '..';
import { spread } from "solid-js/web";

export function parseChildren(
  children: JSX.Element | undefined,
  keyPath: string[],
) {
  
  return toArray(children).map((child, index) => {
    if (child) {
      // const { key } = child;
      let eventKey = (child as any)?.eventKey ?? child.key;

      const emptyKey = eventKey === null || eventKey === undefined;
      
      if (emptyKey) {
        eventKey = `tmp_key-${[...keyPath, index].join('-')}`;
      }

      const cloneProps = {
        // key: eventKey,
        'data-key': eventKey,
        // eventKey,
      } as any;

      if (process.env.NODE_ENV !== 'production' && emptyKey) {
        // cloneProps.warnKey = true;
      }
      // console.log("child=", typeof child);
      // console.log(cloneProps)
      // Object.assign(child, cloneProps);
      spread(child as HTMLElement, cloneProps);
      
      // const child = 
      // return React.cloneElement(child, cloneProps);
      // console.log("➑➑➑", child)
      // spread(child as HTMLElement, cloneProps);
      return child
    }

    return child;
  });
}

function convertItemsToNodes(list: ItemType[]) {
  return (list || [])
    .map((opt, index) => {
      if (opt && typeof opt === 'object') {
        const opt_ = opt as { label: string, key: string, type: string, children: JSX.Element};
        const [_, restProps] = splitProps(opt_, ['label', 'children', 'key', 'type']);
        const mergedKey = opt_.key ?? `tmp-${index}`;

        // MenuItemGroup & SubMenuItem
        if (opt_.children || opt_.type === 'group') {
          if (opt_.type === 'group') {
            // Group
            return (
              <MenuItemGroup key={mergedKey} {...restProps} title={opt_.label}>
                {convertItemsToNodes(opt_.children)}
              </MenuItemGroup>
            );
          }

          // Sub Menu
          return (
            <SubMenu key={mergedKey} {...restProps} title={opt_.label}>
              {convertItemsToNodes(opt_.children)}
            </SubMenu>
          );
        }

        // MenuItem & Divider
        if (opt_.type === 'divider') {
          return <Divider key={mergedKey} {...restProps} />;
        }

        return (
          <MenuItem key={mergedKey} {...restProps}>
            {opt_.label}
          </MenuItem>
        );
      }

      return null;
    })
    .filter(opt => opt);
}

export function parseItems(
  children: JSX.Element | undefined,
  items: ItemType[] | undefined,
  keyPath: string[],
) {
  let childNodes = children;

  if (items) {
    childNodes = convertItemsToNodes(items);
  }

  return parseChildren(childNodes, keyPath);
}
