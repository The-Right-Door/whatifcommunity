import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-white font-semibold border-b-2 border-white' : 'text-white hover:text-gray-200';
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
      <Link to="/" className="flex items-center space-x-2 text-white">
        <Users className="h-8 w-8" />
        <span className="text-xl font-bold">What-If Community</span>
      </Link>
      
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/teachers" className={`${isActive('/teachers')} transition-colors pb-1`}>
          Teachers
        </Link>
        <Link to="/subjects" className={`${isActive('/subjects')} transition-colors pb-1`}>
          Subjects
        </Link>
        <Link to="/classes" className={`${isActive('/classes')} transition-colors pb-1`}>
          Classes
        </Link>
        <Link to="/forums" className={`${isActive('/forums')} transition-colors pb-1`}>
          Discussion Forums
        </Link>
        <Link to="/announcements" className={`${isActive('/announcements')} transition-colors pb-1`}>
          Announcements
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <Link 
          to="/login" 
          className={`flex items-center space-x-2 ${isActive('/login')} transition-colors`}
        >
          <Users className="h-5 w-5" />
          <span>Sign In</span>
        </Link>
      </div>
    </nav>
  );
}