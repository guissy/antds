import { cleanup, screen } from "solid-testing-library";

import { renderWithAntdProvider } from "./test-utils";
import { AccountBookOutlined as Icon } from "../src";

describe("Icon", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithAntdProvider(() => <Icon data-testid="icon" />);
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toBeInTheDocument();
  });

  it("should render <svg> tag with children", () => {
    renderWithAntdProvider(() => (
      <Icon data-testid="icon">
      </Icon>
    ));
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toBeInstanceOf(HTMLSpanElement);
    expect(icon.firstChild).toBeInstanceOf(SVGElement);
    expect(icon.querySelector("path")).toBeTruthy();
  });


  it("should have semantic anticon class", () => {
    // act
    renderWithAntdProvider(() => <Icon data-testid="icon" />);
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass("anticon");
  });


  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithAntdProvider(() => (
      <Icon class={stubClass} data-testid="icon" />
    ));
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithAntdProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Icon className={stubClass} data-testid="icon" />
    ));

    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithAntdProvider(() => (
      <Icon classList={{ [stubClass]: true }} data-testid="icon" />
    ));
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass(stubClass);
  });

});
