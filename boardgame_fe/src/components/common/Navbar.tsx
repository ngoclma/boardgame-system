import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white font-bold text-xl">
                BoardGame Tracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                to="/"
                className={`${
                  isActive('/') 
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500'
                } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Dashboard
              </Link>
              <Link
                to="/players"
                className={`${
                  isActive('/players') 
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500'
                } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Players
              </Link>
              <Link
                to="/games"
                className={`${
                  isActive('/games') 
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500'
                } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Games
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/"
            className={`${
              isActive('/') 
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-500'
            } block px-3 py-2 rounded-md text-base font-medium`}
          >
            Dashboard
          </Link>
          <Link
            to="/players"
            className={`${
              isActive('/players') 
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-500'
            } block px-3 py-2 rounded-md text-base font-medium`}
          >
            Players
          </Link>
          <Link
            to="/games"
            className={`${
              isActive('/games')
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-500'
            } block px-3 py-2 rounded-md text-base font-medium`}
          >
            Games
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;