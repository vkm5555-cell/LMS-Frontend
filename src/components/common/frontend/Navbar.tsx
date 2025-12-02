import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
import SignupModal from "../../Modal/SignupModal";
import LoginModal from "../../Modal/LoginModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(localStorage.getItem("token")));
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onStorage = () => setIsLoggedIn(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${apiBaseUrl}/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Logout error", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setShowDropdown(false);
    window.location.href = "/";
  };

  const userRoleRaw = localStorage.getItem("role");
  const userRole = (userRoleRaw ?? '').toLowerCase();

  return (
    <header className="shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-6 py-3">
        {/* Left Section: Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            BBD ED TECH
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link to="#" className="hover:text-blue-600">For Individuals</Link>
            <Link to="#" className="hover:text-blue-600">For Businesses</Link>
            <Link to="#" className="hover:text-blue-600">For Universities</Link>
            <Link to="#" className="hover:text-blue-600">For Governments</Link>
          </nav>
        </div>

        {/* Center Search */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="What do you want to learn?"
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600">
              🔍
            </button>
          </div>
        </div>

        {/* Right Links */}
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link to="#" className="hover:text-blue-600">Online Degrees</Link>
          <Link to="#" className="hover:text-blue-600">Careers</Link>

          {!isLoggedIn ? (
            <>
              <button
                type="button"
                className="hover:text-blue-600"
                onClick={() => setIsLoginOpen(true)}
              >
                Log In
              </button>
              <button
                onClick={() => setIsSignupOpen(true)}
                className="rounded border border-blue-600 px-3 py-1 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Registration
              </button>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Toggle */}
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <span className="font-semibold">
                  {userRole === "student" ? "Student" : "User"}
                </span>
                <span>▼</span>
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-md z-20">
                  {userRole === "student" && (
                    <>
                      <Link
                        to="/Student-Dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setShowDropdown(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile Settings
                      </Link>
                      <hr className="my-1" />
                    </>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-2xl text-blue-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg px-6 py-4 space-y-4 text-gray-700 font-medium">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="What do you want to learn?"
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-600">
              🔍
            </button>
          </div>

          {/* Nav Links */}
          <Link to="#" className="block hover:text-blue-600">For Individuals</Link>
          <Link to="#" className="block hover:text-blue-600">For Businesses</Link>
          <Link to="#" className="block hover:text-blue-600">For Universities</Link>
          <Link to="#" className="block hover:text-blue-600">For Governments</Link>

          <Link to="#" className="block hover:text-blue-600">Online Degrees</Link>
          <Link to="#" className="block hover:text-blue-600">Careers</Link>

          {!isLoggedIn ? (
            <>
              <button
                type="button"
                className="block w-full text-left hover:text-blue-600"
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsOpen(false);
                }}
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setIsSignupOpen(true);
                  setIsOpen(false);
                }}
                className="block w-full rounded border border-blue-600 px-3 py-2 text-center text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Registration
              </button>
            </>
          ) : (
            <>
              {userRole === "student" && (
                <>
                  <Link
                    to="/Student-Dashboard"
                    className="block hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="#"
                    className="block hover:text-blue-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile Settings
                  </Link>
                </>
              )}
              <button
                type="button"
                className="block w-full text-left text-red-600"
                onClick={() => logout()}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      {/* Signup Modal */}
      <SignupModal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} />
      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </header>
  );
};

export default Navbar;
