import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
  TaskIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    roles?: string[];
  }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <BoxCubeIcon />,
    name: "User Management",
    subItems: [
      { name: "User List", path: "/users", roles: ["SuperAdmin"] },
      { name: "Add User", path: "/users/add", roles: ["SuperAdmin"] },
      { name: "Role List", path: "/role", roles: ["SuperAdmin"] },
      { name: "Add Role", path: "/role/add", roles: ["SuperAdmin"] },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Modules",
    subItems: [
      { name: "Modules List", path: "/module", roles: ["Admin"] },
      { name: "Add Modules", path: "/module/add", roles: ["SuperAdmin"] },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Courses",
    subItems: [
      { name: "List Courses", path: "/courses/adminCourseList", roles: ["SuperAdmin"] },
      { name: "List Courses", path: "/courses", roles: ["Teacher"] },
      { name: "Add Course", path: "/courses/add", roles: ["Teacher"] },
      { name: "Add Course Type", path: "/courses/type/add", roles: ["Admin"] },
      { name: "List Course Category", path: "/courses/coursecategories/list", roles: ["SuperAdmin", "Teacher"] },
      { name: "Add Course Category", path: "/courses/coursecategories/add", roles: ["SuperAdmin", "Teacher"] },
      { name: "Add Course Sub Category", path: "/courses/coursecategories/addsubcat", roles: ["SuperAdmin", "Teacher"] },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Batch",
    subItems: [
      { name: "Add Batch", path: "/Batch/addBatch", roles: ["Teacher"] },
      { name: "List Batche", path: "/Batch", roles: ["Teacher"] },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Assignment",
    subItems: [
      { name: "Add Assignment", path: "/Assignment/add", roles: ["Teacher"] },
      { name: "List Assignments", path: "/Assignment/list", roles: ["Teacher"] },
    ],
  },
  {
    icon: <TaskIcon />,
    name: "Quick Quiz",
    subItems: [
      { name: "Add Quiz", path: "/quick-quiz/add", roles: ["Teacher"] },
      { name: "List Quizzes", path: "/quick-quiz/list", roles: ["Teacher"] },
    ],
  },
  {
    icon: <PageIcon />,
    name: "Meetings",
    path: "#",
  },
  {
    icon: <CalenderIcon />,
    name: "Calendar",
    path: "/calendar",
  },
  {
    icon: <ListIcon />,
    name: "Messages",
    path: "#",
  },
  {
    icon: <PlugInIcon />,
    name: "Settings",
    subItems: [
      { name: "General", path: "/settings/general" },
      { name: "Account", path: "/settings/account" },
      { name: "Security", path: "/settings/security" },
    ],
  },
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
  },
  {
    name: "Forms",
    icon: <ListIcon />,
    subItems: [{ name: "Form Elements", path: "/form-elements", pro: false }],
  },
  {
    name: "Tables",
    icon: <TableIcon />,
    subItems: [{ name: "Basic Tables", path: "/basic-tables", pro: false }],
  },
  {
    name: "Pages",
    icon: <PageIcon />,
    subItems: [
      { name: "Blank Page", path: "/blank", pro: false },
      { name: "404 Error", path: "/error-404", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart", pro: false },
      { name: "Bar Chart", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts", pro: false },
      { name: "Avatar", path: "/avatars", pro: false },
      { name: "Badge", path: "/badge", pro: false },
      { name: "Buttons", path: "/buttons", pro: false },
      { name: "Images", path: "/images", pro: false },
      { name: "Videos", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/admin", pro: false },
      { name: "Sign Up", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [userRole, setUserRole] = useState<string[]>([]);

  useEffect(() => {
    const userRoleStr = localStorage.getItem("role") || "";
    setUserRole(userRoleStr.split(",").map(r => r.trim()).filter(Boolean));
  }, []);

  // 🔴 FIX: use key instead of index
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    key: string;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;

      items.forEach((nav) => {
        if (nav.subItems?.some(sub => location.pathname === sub.path)) {
          setOpenSubmenu({ type: menuType as any, key: nav.name });
          submenuMatched = true;
        }
      });
    });

    if (!submenuMatched) setOpenSubmenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!openSubmenu) return;
    const refKey = `${openSubmenu.type}-${openSubmenu.key}`;
    const el = subMenuRefs.current[refKey];
    if (el) {
      setSubMenuHeight(prev => ({
        ...prev,
        [refKey]: el.scrollHeight,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (key: string, menuType: "main" | "others") => {
    setOpenSubmenu(prev =>
      prev?.type === menuType && prev.key === key ? null : { type: menuType, key }
    );
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav) => {
        const refKey = `${menuType}-${nav.name}`;
        const isOpen = openSubmenu?.type === menuType && openSubmenu?.key === nav.name;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(nav.name, menuType)}
                className={`menu-item group ${isOpen ? "menu-item-active" : "menu-item-inactive"}`}
              >
                <span>{nav.icon}</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <>
                    <span className="menu-item-text">{nav.name}</span>
                    <ChevronDownIcon className={`ml-auto transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </>
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path}
                  className={`menu-item ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}
                >
                  <span>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}

            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[refKey] = el;
                }}
                style={{ height: isOpen ? `${subMenuHeight[refKey]}px` : "0px" }}
                className="overflow-hidden transition-all"
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map(sub => (
                    <li key={sub.name}>
                      <Link
                        to={sub.path}
                        className={`menu-dropdown-item ${
                          isActive(sub.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col top-0 px-5 left-0 bg-white h-screen transition-all z-50 border-r
        ${isExpanded || isHovered || isMobileOpen ? "w-[290px]" : "w-[90px]"}`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <nav className="mb-6">
        {renderMenuItems(navItems, "main")}
        {renderMenuItems(othersItems, "others")}
      </nav>
      {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
    </aside>
  );
};

export default AppSidebar;
