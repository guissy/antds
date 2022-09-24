import { createSignal, For, onMount } from "solid-js";
import { styled } from "solid-styled-components";
import { setTwoToneColor } from "../../src";
import * as AntdIcons from "../../src/icons";
const allIcons = AntdIcons;
const iconsList = Object.keys(allIcons).filter(iconName => iconName.includes("TwoTone"));
const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 80vw;
  margin: auto;
`;
const Card = styled.div`
  height: 90px;
  margin: 12px 0 16px;
  width: 16.6666%;
  text-align: center;
`;
const NameDescription = styled.p`
  display: block;
  text-align: center;
  transform: scale(0.83);
  font-family: 'Lucida Console', Consolas;
  white-space: nowrap;
`;
const Text = styled.span`
  margin: 0 0.5rem;
`;
export default function AllIconDemo(props) {
  const [primaryColor, setPrimaryColor] = createSignal("#1890ff")
  onMount(() => {
    setTwoToneColor(primaryColor());
  })

  const onPrimaryColorChange = (e) => {
    setPrimaryColor(e.currentTarget.value);
    setTwoToneColor(e.currentTarget.value);
    console.log("¸¸♬·¯·♪·¯·♫¸¸¸¸♫·¯·♪¸♩·¯·♬¸¸");
    
  }

  return <div style={{
    color: "#555"
  }}>
    <h1 style={{
      textAlign: "center"
    }}>Two Tone</h1>
    <div style={{
      textAlign: "center"
    }}>
      <h2>Primary Color</h2>
      <input type="color" value={primaryColor()} onChange={onPrimaryColorChange} />
      <Text>{primaryColor()}</Text>
    </div>
    <Container>
      <For each={iconsList}>{(iconName) => {
        const Component = allIcons[iconName];
        return <Card>
          <Component style={{ fontSize: "16px" }} />
          <NameDescription>{iconName}</NameDescription>
        </Card>;
      }}</For>
    </Container>
  </div>;
}