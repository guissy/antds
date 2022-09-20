import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "./test-utils";
// import { AccountBookOutlined as Icon } from "@ant-design/icons";
import Icon from "../packages/antd-solid-icons/icons-react/src/icons/AccountBookOutlined";
// import { iconStyles } from "./icon.styles";

describe("Icon", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Icon data-testid="icon" />);
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toBeInTheDocument();
  });

  it("should render <svg> tag with children", () => {
    renderWithHopeProvider(() => (
      <Icon data-testid="icon">
      </Icon>
    ));
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toBeInstanceOf(HTMLSpanElement);
    expect(icon.firstChild).toBeInstanceOf(SVGElement);
    expect(icon.querySelector("path")).toBeTruthy();
  });

  // it("should render svg component provided with the as prop", () => {
  //   // act
  //   renderWithHopeProvider(() => <Icon data-testid="icon" as={IconCheckCircle} />);
  //   const icon = screen.getByTestId("icon");

  //   // assert
  //   expect(icon).toBe(<IconCheckCircle />);
  // });

  it("should have semantic anticon class", () => {
    // act
    renderWithHopeProvider(() => <Icon data-testid="icon" />);
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass("anticon");
  });


  it.skip("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
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
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Icon className={stubClass} data-testid="icon" />
    ));

    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass(stubClass);
  });

  it.skip("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Icon classList={{ [stubClass]: true }} data-testid="icon" />
    ));
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass(stubClass);
  });

});
