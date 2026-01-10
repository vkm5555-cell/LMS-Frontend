import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

// Icons
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

/* ===================== MENU CONFIG (UNCHANGED) ===================== */

const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
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
  { icon: <PageIcon />, name: "Meetings", path: "#" },
  { icon: <CalenderIcon />, name: "Calendar", path: "/calendar" },
  { icon: <ListIcon />, name: "Messages", path: "#" },
  {
    icon: <PlugInIcon />,
    name: "Settings",
    subItems: [
      { name: "General", path: "/settings/general" },
      { name: "Account", path: "/settings/account" },
      { name: "Security", path: "/settings/security" },
    ],
  },
  { icon: <UserCircleIcon />, name: "User Profile", path: "/profile" },
  { name: "Forms", icon: <ListIcon />, subItems: [{ name: "Form Elements", path: "/form-elements" }] },
  { name: "Tables", icon: <TableIcon />, subItems: [{ name: "Basic Tables", path: "/basic-tables" }] },
  {
    name: "Pages",
    icon: <PageIcon />,
    subItems: [
      { name: "Blank Page", path: "/blank" },
      { name: "404 Error", path: "/error-404" },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Charts",
    subItems: [
      { name: "Line Chart", path: "/line-chart" },
      { name: "Bar Chart", path: "/bar-chart" },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "UI Elements",
    subItems: [
      { name: "Alerts", path: "/alerts" },
      { name: "Avatar", path: "/avatars" },
      { name: "Badge", path: "/badge" },
      { name: "Buttons", path: "/buttons" },
      { name: "Images", path: "/images" },
      { name: "Videos", path: "/videos" },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Authentication",
    subItems: [
      { name: "Sign In", path: "/admin" },
      { name: "Sign Up", path: "/signup" },
    ],
  },
];

/* ===================== COMPONENT ===================== */

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const location = useLocation();
  
  const [userRole, setUserRole] = useState<string[]>([]);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  
  useEffect(() => {
    const roleStr = localStorage.getItem("role") || "";
    setUserRole(roleStr.split(",").map(r => r.trim()).filter(Boolean));
  }, []);

  /* 🔐 ROLE CHECK */
  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    return roles.some(role => userRole.includes(role));
  };

  /* ================= SUB MENU STATE (UNCHANGED) ================= */

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

  /* ================= ROLE-AWARE RENDER ================= */

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items
        .filter(nav => {
          if (nav.subItems) {
            return nav.subItems.some(sub => hasAccess(sub.roles));
          }
          return hasAccess(nav.roles);
        })
        .map((nav) => {
          const refKey = `${menuType}-${nav.name}`;
          const isOpen = openSubmenu?.type === menuType && openSubmenu?.key === nav.name;

          return (
            <li key={nav.name}>
              {nav.subItems ? (
                <button
                  onClick={() => handleSubmenuToggle(nav.name, menuType)}
                  className={`menu-item group ${
                    isOpen ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span>{nav.icon}</span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <>
                      <span className="menu-item-text">{nav.name}</span>
                      <ChevronDownIcon
                        className={`ml-auto transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </>
                  )}
                </button>
              ) : (
                nav.path && (
                  <Link
                    to={nav.path}
                    onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
                    className={`menu-item ${
                      isActive(nav.path)
                        ? "menu-item-active"
                        : "menu-item-inactive"
                    }`}
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
                    {nav.subItems
                      .filter(sub => hasAccess(sub.roles))
                      .map(sub => (
                        <li key={sub.name}>
                          <Link
                            to={sub.path}
                            onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
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
    <>
      {/* show sidebar on desktop always; on small/medium screens show it only when isMobileOpen */}
      <aside
        className={`${isMobileOpen ? "flex" : "hidden"} lg:flex fixed top-12 md:top-16 bottom-0 left-0 flex-col px-5 bg-white transition-all border-r
          ${isExpanded || isHovered || isMobileOpen ? "w-[290px]" : "w-[90px]"}
          ${isMobileOpen ? "z-50" : "z-40"}`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Mobile user header + toggle (visible only on small screens) */}
        <div className="w-full lg:hidden flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <UserCircleIcon />
            <div className="text-sm">
              <div className="font-medium">{localStorage.getItem('name') ?? 'User'}</div>
              <div className="text-xs text-gray-500">{localStorage.getItem('email') ?? ''}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMobileUserMenu((s) => !s)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="User menu"
          >
            <HorizontaLDots />
          </button>
        </div>

        {showMobileUserMenu && (
          <div className="lg:hidden bg-white border rounded mb-3 shadow-sm p-2">
            <Link to="/profile" onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }} className="block py-1 px-2 hover:bg-gray-50 rounded">Profile</Link>
            <Link to="/settings/account" onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }} className="block py-1 px-2 hover:bg-gray-50 rounded">Account</Link>
            <button
              type="button"
              className="block w-full text-left py-1 px-2 hover:bg-gray-50 rounded"
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); if (isMobileOpen) toggleMobileSidebar(); window.location.href = '/admin'; }}
            >
              Logout
            </button>
          </div>
        )}

        <nav className="mb-6">
          {renderMenuItems(navItems, "main")}
          {renderMenuItems(othersItems, "others")}
        </nav>
        {(isExpanded || isHovered || isMobileOpen) && <SidebarWidget />}
      </aside>
    </>
  );
};

export default AppSidebar;
