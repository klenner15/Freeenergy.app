import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, FileText, User } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-neutral-100 shadow-lg">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center py-3 px-4 ${location === '/' ? 'text-primary' : 'text-neutral-400'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Início</span>
          </div>
        </Link>
        
        <Link href="/search">
          <div className={`flex flex-col items-center py-3 px-4 ${location === '/search' ? 'text-primary' : 'text-neutral-400'}`}>
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Buscar</span>
          </div>
        </Link>
        
        <Link href="/orders">
          <div className={`flex flex-col items-center py-3 px-4 ${location.startsWith('/order') ? 'text-primary' : 'text-neutral-400'}`}>
            <FileText className="h-6 w-6" />
            <span className="text-xs mt-1">Pedidos</span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className={`flex flex-col items-center py-3 px-4 ${location === '/profile' ? 'text-primary' : 'text-neutral-400'}`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Perfil</span>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
