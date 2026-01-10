import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // push content with padding on large screens so sidebar never overlays desktop content
  const desktopPaddingClass = isExpanded || isHovered ? "lg:pl-[290px]" : "lg:pl-[90px]";

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${desktopPaddingClass} ${isMobileOpen ? "pl-0" : ""}`}
      >
        <AppHeader />
        {/* pad top by header height so fixed header doesn't overlap content
            IMPORTANT: remove mx-auto from the main container on large screens so content starts
            right after the sidebar padding instead of being centered (removes the large gap). */}
        <main className="pt-12 md:pt-16 p-4 w-full relative z-0">
          {/* Center on small screens, but left-align on lg so padding-left aligns content with sidebar */}
          <div className="max-w-8xl w-full mx-auto lg:mx-0">
            <Outlet />
          </div>
        </main>
      </div>
      <Backdrop />
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
