import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

const logoPath = "/images/bbdu-logo.gif";

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  const [errored, setErrored] = useState(false);
  if (errored) {
    // simple text fallback to avoid broken-image icon
    return <div className={`flex items-center ${className}`}><span className="font-bold text-sm">BBDU</span></div>;
  }
  return <img src={logoPath} alt="BBDU logo" className={className} onError={() => setErrored(true)} />;
};

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    // make header relative so dropdowns can be absolutely positioned inside it
    <header className="fixed top-0 left-0 right-0 z-50 bg-white h-12 md:h-16 flex items-center px-3 md:px-6 shadow relative">
      <div className="w-full max-w-8xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg lg:w-11 lg:h-11 lg:border"
            onClick={handleToggle}
            aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isMobileOpen}
          >
            {/* visible stroked icons (use currentColor) */}
            {isMobileOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* mobile: small logo; desktop: larger logo */}
          <Link to="/dashboard" className="flex items-center">
            <div className="lg:hidden">
              <Logo className="h-7 w-auto object-contain" />
            </div>
            <div className="hidden lg:block">
              <Logo className="h-10 w-auto object-contain" />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 relative">
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggleButton />
            <NotificationDropdown />
          </div>

          {/* mobile "more" / expand menu button */}
          <div className="lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setApplicationMenuOpen((s) => !s)}
              className="p-2 rounded hover:bg-gray-100"
            >
              {/* three dots icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>

            {isApplicationMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border rounded shadow-md overflow-hidden z-50">
                <Link to="/profile" className="block px-3 py-2 hover:bg-gray-50">Profile</Link>
                <Link to="/settings/account" className="block px-3 py-2 hover:bg-gray-50">Account</Link>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-gray-50"
                  onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); window.location.href = '/admin'; }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
