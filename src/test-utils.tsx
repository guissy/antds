import { JSX, Component } from "solid-js";
import { render } from "solid-testing-library";

// import { HopeProvider, HopeThemeConfig } from "../hope-provider";
const HopeProvider: Component<{config: HopeThemeConfig, children: JSX.Element}> = ({children}) => children;
type HopeThemeConfig = {}
export function renderWithHopeProvider(callback: () => JSX.Element, config: HopeThemeConfig = {}) {
  return render(() => <HopeProvider config={config}>{callback}</HopeProvider>);
}
