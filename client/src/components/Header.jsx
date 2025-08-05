import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-green-700 tracking-tight">
          PlantCare
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <a href="/" className="hover:text-green-600 transition">Home</a>
          <a href="/shop" className="hover:text-green-600 transition">Shop</a>
          <a href="/community" className="hover:text-green-600 transition">Community</a>
          <a href="/about" className="hover:text-green-600 transition">About</a>
        </nav>

        {/* Auth Buttons */}
        <div className="space-x-3">
          <button className="text-sm font-medium text-green-700 hover:text-green-900 transition">
            Login
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition">
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
