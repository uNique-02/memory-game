import { useState } from "react";
import { LogIn, LogOut, User } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleAuthToggle = () => {
    setIsLoggedIn((prev) => !prev);
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="Logo" className="w-8 h-8" />
        <span className="text-xl font-semibold text-gray-800">MyWebsite</span>
      </div>

      {/* Right side icons */}
      <div className="flex items-center space-x-4">
        <User className="w-6 h-6 text-gray-700" />
        {isLoggedIn ? (
          <LogOut
            onClick={handleAuthToggle}
            className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition"
            title="Logout"
          />
        ) : (
          <LogIn
            onClick={handleAuthToggle}
            className="w-6 h-6 text-green-500 cursor-pointer hover:text-green-600 transition"
            title="Login"
          />
        )}
      </div>
    </nav>
  );
}
