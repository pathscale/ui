import Dock from "./Dock";
import DockItem from "./DockItem";
import { Component } from "solid-js";

const DockShowcase: Component<{}> = (props) => {
  
    return (<Dock
      size="lg"
      variant="floating"
      position="bottom"
      color="primary"
      onChange={(value) => console.log("Selected:", value)}
    >
      <DockItem value="home">🏠</DockItem>
      <DockItem value="profile" color="secondary">
        👤
      </DockItem>
      <DockItem value="settings">⚙️</DockItem>
    </Dock>
    )
};
export default DockShowcase