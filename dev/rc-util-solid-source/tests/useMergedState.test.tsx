import useMergedState from "../src/hooks/useMergedState"
import { render, screen, fireEvent } from "solid-testing-library";
import { Component, createSignal } from "solid-js";

describe("hehe", () => {
    beforeEach(() => {
       jest.useFakeTimers();
    })
    afterEach(() => {
        jest.useRealTimers();
     })
    let setState2: (n: number) => void;
    const App: Component<{defaultValue?: number, value?: number}> = (props) => {
        const [state, setState] = useMergedState(props.defaultValue, {
            value: () => props.value
        });
        setState2 = setState
        return <>{state()}</>;
    }
    it("defaultState ok", async() => {
        const { container } = render(() => <App defaultValue={1} />);
        expect(container.textContent).toBe("1");
        setState2(2);
        expect(container.textContent).toBe("2");
    })

    it("value changed", () => {
        const Main = () => {
            const [value, setValue] = createSignal<number>();
            setTimeout(() => {
                setValue(2)
            }, 500)
            return <App defaultValue={1} value={value()} />
        }
        const { container } = render(() => <Main />);
        expect(container.textContent).toBe("1");
        jest.runAllTimers();
        expect(container.textContent).toBe("2");
    })
})
