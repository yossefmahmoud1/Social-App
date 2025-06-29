import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CiMenuBurger } from "react-icons/ci";
import { MdCancel } from "react-icons/md";
import { useAuth } from "../Context/AuthContext";

const NavBar = () => {
  const [openMenu, setOpenMenu] = useState(false);
  const { signinWithGoogle, signOut, user, profilePicture } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email || "User";

  // Default avatar URL
  const defaultAvatar =
    "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

  // Use profile picture directly from Google
  const userAvatar = profilePicture || defaultAvatar;

  const links = [
    { to: "/", label: "Home" },
    { to: "/create", label: "Create Post" },
    { to: "/communities", label: "Communities" },
    { to: "/community/create", label: "Create Community" },
  ];

  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(10,10,10,0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center p-4">
          {/* Logo */}
          <Link to="/">
            <h1 className="font-mono text-xl font-bold text-white">
              Social <span className="text-purple-500">app</span>
            </h1>
          </Link>

          {/* Desktop Links */}
          {user && (
            <div className="hidden md:flex gap-6 items-center text-white">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="hover:text-purple-500 transition-all duration-300 hover:scale-110"
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Auth Buttons & Avatar */}
          <div className="hidden md:flex items-center gap-4 text-white">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">{displayName}</span>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
                  <img
                    src={userAvatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log("Image failed to load, using default avatar");
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                </div>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
                  onClick={signOut}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all duration-300 mr-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div
            className="md:hidden text-white text-2xl cursor-pointer"
            onClick={() => setOpenMenu(!openMenu)}
          >
            {openMenu ? <MdCancel /> : <CiMenuBurger />}
          </div>
        </div>

        {/* Mobile Menu Content */}
        {openMenu && user && (
          <div className="md:hidden flex flex-col gap-4 pb-4 text-white px-4">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpenMenu(false)}
                className="hover:text-purple-500 transition-all duration-300"
              >
                {label}
              </Link>
            ))}

            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
                  <img
                    src={userAvatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log("Image failed to load, using default avatar");
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                </div>
                <span className="text-sm">{displayName}</span>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300"
                  onClick={signOut}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
