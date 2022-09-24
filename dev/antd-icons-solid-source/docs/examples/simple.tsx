import { styled } from "solid-styled-components";
import { type JSX } from "solid-js";
import { AntDesignOutlined, DashboardOutlined, TwitterOutlined } from "../../src";
import { kebabCase } from "lodash"
const Div = styled.div`
  position: relative;
  margin-bottom: 1rem;
  line-height: 1;
  &:after {
    width: 100%;
    height: 1px;
    content: '';
    position: absolute;
    bottom: 0.125em;
    left: 0;
    background-color: hotpink;
    z-index: -100;
  }
  &:before {
    width: 100%;
    height: 1px;
    content: '';
    position: absolute;
    top: 0.125em;
    left: 0;
    background-color: hotpink;
    z-index: -100;
  }
`;

export const toStyleObject = (style: JSX.CSSProperties) => {
  if (typeof style === "object") {
    return Object.entries(style).reduce((s, [k, v]) =>( {...s, [kebabCase(k)]: v}), {});
  }
};

const renderStatement = (fontSize: string, index: number) => {
  const style = {
    fontSize,
    color: fontSize === "48px" && "lightblue" || "inherit"
  };
  console.log(toStyleObject(style));
  
  return <Div>
    <div style={toStyleObject(style)}>
      {fontSize}
      {"Ant Design"}
      <AntDesignOutlined />
      {"0123"}
      <DashboardOutlined />
      {"\u4F60\u597D"}
      <TwitterOutlined />
    </div>
  </Div>;
}
const displaySize = ['64px', '48px', '32px', '24px', '16px', '12px', '8px'];
const relatedHref =
'https://blog.prototypr.io/align-' +
'svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4';

const SimpleDemo = () => {
  return <div>
    <h1>Simple Demo - Icons Alignments</h1>
    {displaySize.map((fontSize, index) => renderStatement(fontSize, index))}
    {"See"}
    {" "}
    <a href={relatedHref} target="_blank" rel="noopener noreferrer">related blog</a>
    {" "}
    {"for detail."}
  </div>;
}
type SimpleDemoType = typeof SimpleDemo & {
  displaySize: string[];
  relatedHref: string;
  renderStatement: typeof renderStatement;
};
(SimpleDemo as SimpleDemoType).displaySize = displaySize;
(SimpleDemo as SimpleDemoType).relatedHref = relatedHref;
(SimpleDemo as SimpleDemoType).renderStatement = renderStatement;
export default SimpleDemo as SimpleDemoType;