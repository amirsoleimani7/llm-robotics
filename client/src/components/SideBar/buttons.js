import { BsLayoutSidebarReverse } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { RiChatNewFill } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { IoIosSettings } from "react-icons/io";

export const topButtons = [
  {
    id: "sidebar",
    icon: BsLayoutSidebarReverse,
    label: "Toggle Sidebar",
    onClick: "handle_sidebar", // This will be passed from parent
  },
  // {
  //   id: "search",
  //   icon: FaSearch,
  //   label: "Search",
  //   onClick: "handle_search",
  // },
  {
    id: "newChat",
    icon: RiChatNewFill,
    label: "New Chat",
    onClick: "handle_newChat",
  },
];

export const bottomButtons = [
  {
    id: "settings",
    icon: IoIosSettings,
    label: "Settings",
    onClick: "handle_settings",
  },
  {
    id: "profile",
    icon: CgProfile,
    label: "Profile",
    onClick: "handle_profile",
  }
];
