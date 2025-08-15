import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useWishlist from '../hooks/useWishlist';
import useMyPlants from '../hooks/useMyPlants';

const Header = () => {
  const { isAuthed, user, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { count: myPlantsCount } = useMyPlants();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-green-700 tracking-tight">
          PlantCare
        </Link>

        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <Link to="/" className="hover:text-green-600 transition">Home</Link>
          <Link to="/plantgallery" className="hover:text-green-700">Plants</Link>
          <Link to="/care" className="hover:text-green-700">Care Guides</Link>
          <Link to="/blog" className="hover:text-green-700">Blog</Link>
          {/* <Link to="/community" className="hover:text-green-600 transition">Community</Link> */}
          {/* <Link to="/about" className="hover:text-green-600 transition">About</Link> */}
          {isAuthed && (
            <>
              {/* <Link to="/my-plants" className="hover:text-green-600 transition">My Plants</Link> */}

              <Link to="/my-plants" className="relative px-3 py-2 hover:opacity-90">
                My Plants
                <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 text-[11px] px-1 rounded-full bg-green-600 text-white">
                  {myPlantsCount}
                </span>
              </Link>

              <Link to="/my-wishlist" className="relative px-3 py-2 hover:opacity-90">
                Wishlist
                <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 text-[11px] px-1 rounded-full bg-pink-600 text-white">
                  {wishlistCount}
                </span>
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin" className="hover:text-green-600 transition">Admin</Link>
          )}
          
        </nav>

        <div className="space-x-3">
          {!isAuthed ? (
            <>
              <Link to="/login" className="text-sm font-medium text-green-700 hover:text-green-900 transition">
                Login
              </Link>
              <Link to="/signup" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-700 transition">
                Sign Up
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-200 transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
