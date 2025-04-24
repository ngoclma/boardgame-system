import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, UsersIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20">
          <div className="flex w-full">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white font-bold text-3xl flex items-center space-x-2">
                <img src="/fvh_logo.png" alt="Logo" className="h-12 w-12" />
                <span>For Vinh Hiển</span>
              </Link>
            </div>
            <div className="hidden sm:flex sm:items-center sm:justify-center sm:flex-1 sm:space-x-8">
              <Link
                to="/"
                className={`${
                  isActive('/') 
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500'
                } px-6 py-3 rounded-md text-base font-medium transition-colors flex items-center space-x-2`}
              >
                <HomeIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/players"
                className={`${
                  isActive('/players') 
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500'
                } px-6 py-3 rounded-md text-base font-medium transition-colors flex items-center space-x-2`}
              >
                <UsersIcon className="h-5 w-5" />
                <span>Players</span>
              </Link>
              <Link
                to="/games"
                className={`${
                  isActive('/games') 
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-100 hover:bg-blue-500'
                } px-6 py-3 rounded-md text-base font-medium transition-colors flex items-center space-x-2`}
              >
                <PuzzlePieceIcon className="h-5 w-5" />
                <span>Games</span>
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
            } px-4 py-3 rounded-md text-base font-medium flex items-center space-x-2`}
          >
            <HomeIcon className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/players"
            className={`${
              isActive('/players') 
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-500'
            } px-4 py-3 rounded-md text-base font-medium flex items-center space-x-2`}
          >
            <UsersIcon className="h-5 w-5" />
            <span>Players</span>
          </Link>
          <Link
            to="/games"
            className={`${
              isActive('/games')
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-500'
            } px-4 py-3 rounded-md text-base font-medium flex items-center space-x-2`}
          >
            <PuzzlePieceIcon className="h-5 w-5" />
            <span>Games</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;