import React from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import Logo from '@/components/ui/logo';
import { useAuth } from '@/hooks/use-auth';

interface MobileNavbarProps {
  cartItemsCount?: number;
  onSearchClick?: () => void;
  onCartClick?: () => void;
}

const MobileNavbar: React.FC<MobileNavbarProps> = ({
  cartItemsCount = 0,
  onSearchClick,
  onCartClick
}) => {
  const { user } = useAuth();
  
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/">
            <Logo size="small" />
        </Link>
        <div className="flex items-center space-x-3">
          <button 
            className="text-neutral-500 p-1" 
            onClick={onSearchClick}
            aria-label="Search"
          >
            <Search className="h-6 w-6" />
          </button>
          <button 
            className="relative text-neutral-500 p-1" 
            onClick={onCartClick}
            aria-label="Cart"
          >
            <ShoppingBag className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
      
      {user && user.address && (
        <div className="px-4 py-2 flex items-center space-x-2 text-sm border-t border-gray-100">
          <div className="flex items-center text-neutral-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{user.address}</span>
          </div>
          <button className="text-secondary text-xs font-medium">Alterar</button>
        </div>
      )}
    </nav>
  );
};

export default MobileNavbar;
