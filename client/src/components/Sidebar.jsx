// Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Search by Reg No", path: "/search-by-regno" },
    { name: "Search by Club", path: "/search-by-club" },
    { name: "Joined At Least One Club", path: "/joined-students" },
    { name: "Not Responded", path: "/not-responded" },
    { name: "Duplicate Registrations", path: "/duplicates" },
    { name: "Message Panel", path: "/message-panel" },
  ];

  return (
    <>
      {/* Sidebar container */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transition-transform z-50
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">College Club</h2>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen && setOpen(false)} // close sidebar on mobile click
              className={({ isActive }) =>
                `px-4 py-2 rounded-md transition-colors hover:bg-gray-700 ${
                  isActive ? "bg-gray-700 font-semibold" : ""
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}