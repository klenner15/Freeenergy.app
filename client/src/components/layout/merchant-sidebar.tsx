import React from 'react';
import { Link, useLocation } from 'wouter';
import Logo from '@/components/ui/logo';
import { 
  Home, 
  ShoppingBag, 
  ClipboardList, 
  Users, 
  BarChart, 
  Settings,
  Zap
} from 'lucide-react';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, text, active }) => {
  return (
    <li>
      <Link href={href}>
        <a className={`flex items-center px-4 py-3 ${active 
          ? 'text-primary bg-primary/5' 
          : 'text-neutral-700 hover:bg-neutral-50'} rounded-lg`}>
          {icon}
          <span className="ml-3">{text}</span>
        </a>
      </Link>
    </li>
  );
};

const MerchantSidebar: React.FC = () => {
  const [location] = useLocation();
  
  return (
    <aside className="w-64 bg-white shadow-md h-screen flex flex-col">
      <div className="p-4 border-b border-neutral-100">
        <Logo className="mx-auto" />
      </div>
      
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          <SidebarItem 
            href="/merchant/dashboard" 
            icon={<Home className="h-5 w-5" />} 
            text="Dashboard"
            active={location === "/merchant/dashboard"}
          />
          
          <SidebarItem 
            href="/merchant/products" 
            icon={<ShoppingBag className="h-5 w-5" />} 
            text="Produtos"
            active={location === "/merchant/products"}
          />
          
          <SidebarItem 
            href="/merchant/orders" 
            icon={<ClipboardList className="h-5 w-5" />} 
            text="Pedidos"
            active={location === "/merchant/orders"}
          />
          
          <SidebarItem 
            href="/merchant/customers" 
            icon={<Users className="h-5 w-5" />} 
            text="Clientes"
            active={location === "/merchant/customers"}
          />
          
          <SidebarItem 
            href="/merchant/reports" 
            icon={<BarChart className="h-5 w-5" />} 
            text="Relatórios"
            active={location === "/merchant/reports"}
          />
          
          <SidebarItem 
            href="/merchant/settings" 
            icon={<Settings className="h-5 w-5" />} 
            text="Configurações"
            active={location === "/merchant/settings"}
          />
        </ul>
        
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <div className="bg-green-brand/10 text-green-brand rounded-lg p-4">
            <h4 className="font-medium text-sm flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Energia Sustentável
            </h4>
            <p className="text-xs mt-2">
              Economize até 30% na conta de energia com nosso programa de sustentabilidade.
            </p>
            <button className="mt-2 text-xs font-medium underline">
              Saiba mais
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default MerchantSidebar;
