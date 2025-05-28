export { SidebarProvider, useSidebarContext } from "./SidebarContext";
export { SidebarPanel } from "./SidebarPanel";
export { SidebarContent } from "./SidebarContent";
export { SidebarHeader } from "./SidebarHeader";
export { SidebarNav, SidebarNavItem } from "./SidebarNav";

import { SidebarProvider } from "./SidebarContext";
import { SidebarPanel } from "./SidebarPanel";
import { SidebarContent } from "./SidebarContent";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav, SidebarNavItem } from "./SidebarNav";


const Sidebar = Object.assign(SidebarProvider, {
  Panel: SidebarPanel,
  Content: SidebarContent,
  Header: SidebarHeader,
  Nav: SidebarNav,
  NavItem: SidebarNavItem,
});

export default Sidebar;
