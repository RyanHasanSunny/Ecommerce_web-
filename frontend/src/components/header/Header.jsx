import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        position: "relative",
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: "1.5rem" }}>Ecommerce</div>
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <FaUserCircle
          size={32}
          style={{ cursor: "pointer" }}
          onClick={() => setDropdownOpen((open) => !open)}
        />
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "110%",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              borderRadius: "6px",
              minWidth: "150px",
              zIndex: 10,
              padding: "0.5rem 0",
            }}
          >
            <button
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "1rem",
              }}
              onClick={() => alert("Go to settings")}
            >
              Settings
            </button>
            <button
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "1rem",
                color: "red",
              }}
              onClick={() => alert("Logged out")}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;