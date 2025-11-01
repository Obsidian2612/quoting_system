import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white font-bold text-xl">
              Engineering Enterprise Motors
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
              New Quote
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/admin" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                  Admin Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;