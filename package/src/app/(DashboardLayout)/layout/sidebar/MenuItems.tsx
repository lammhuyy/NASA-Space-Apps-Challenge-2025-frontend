import {
  IconDatabase,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconRouteSquare2,
  IconReplace,
  IconUserPlus,
  IconPlanet,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "HOME",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "DATA",
  },
  {
    id: uniqueId(),
    title: "Datasets",
    icon: IconDatabase,
    href: "/data/datasets",
  },
  {
    id: uniqueId(),
    title: "Models",
    icon: IconRouteSquare2,
    href: "/data/models",
  },
  {
    id: uniqueId(),
    title: "Retrain",
    icon: IconReplace,
    href: "/data/retrain",
  },
  {
    navlabel: true,
    subheader: "VISUALIZATION",
  },
  {
    id: uniqueId(),
    title: "Orbit Visualizer",
    icon: IconPlanet,
    href: "/utilities/visualization",
  },
  {
    navlabel: true,
    subheader: "AUTH",
  },
  {
    id: uniqueId(),
    title: "Login",
    icon: IconLogin,
    href: "/authentication/login",
  },
  {
    id: uniqueId(),
    title: "Register",
    icon: IconUserPlus,
    href: "/authentication/register",
  }
];

export default Menuitems;


