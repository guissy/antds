import { JSX, Component } from "solid-js";
import { render } from "solid-testing-library";

const AntdProvider: Component<{config: AntdThemeConfig, children: JSX.Element}> = ({children}) => children;
type AntdThemeConfig = {}
export function renderWithAntdProvider(callback: () => JSX.Element, config: AntdThemeConfig = {}) {
  return render(() => <AntdProvider config={config}>{callback}</AntdProvider>);
}
