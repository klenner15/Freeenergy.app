import React from 'react';
import { Redirect } from 'wouter';
import { User, ShoppingBag, Truck, ChevronRight } from 'lucide-react';
import { UserRole } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import Logo from '@/components/ui/logo';

const RoleSelectionPage: React.FC = () => {
  const { user, updateRoleMutation } = useAuth();
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // If user already has a role, redirect to appropriate page
  console.log("RoleSelectionPage - user role:", user.role);
  if (user.role) {
    if (user.role === "CONSUMER") {
      console.log("Redirecting to home");
      return <Redirect to="/" />;
    } else if (user.role === "MERCHANT") {
      console.log("Redirecting to merchant dashboard");
      return <Redirect to="/merchant/dashboard" />;
    } else if (user.role === "DELIVERY") {
      console.log("Redirecting to delivery dashboard");
      return <Redirect to="/delivery/dashboard" />;
    }
  }
  
  const handleRoleSelection = (role: string) => {
    console.log("Selected role:", role);
    updateRoleMutation.mutate({ role });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6">
        <div className="flex justify-center mb-6">
          <Logo size="large" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center">Escolha como deseja continuar</h1>
        <p className="text-neutral-500 text-center mb-8">Selecione seu perfil de acesso</p>
        
        <div className="space-y-4">
          <button 
            className="w-full bg-white border border-neutral-200 rounded-lg p-4 flex items-center shadow-sm"
            onClick={() => handleRoleSelection(UserRole.CONSUMER)}
            disabled={updateRoleMutation.isPending}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Consumidor</h3>
              <p className="text-sm text-neutral-500">Encontre e compre produtos locais</p>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </button>
          
          <button 
            className="w-full bg-white border border-neutral-200 rounded-lg p-4 flex items-center shadow-sm"
            onClick={() => handleRoleSelection(UserRole.MERCHANT)}
            disabled={updateRoleMutation.isPending}
          >
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mr-4">
              <ShoppingBag className="h-6 w-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Comerciante</h3>
              <p className="text-sm text-neutral-500">Venda seus produtos e gerencie sua loja</p>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </button>
          
          <button 
            className="w-full bg-white border border-neutral-200 rounded-lg p-4 flex items-center shadow-sm"
            onClick={() => handleRoleSelection(UserRole.DELIVERY)}
            disabled={updateRoleMutation.isPending}
          >
            <div className="w-12 h-12 rounded-full bg-green-brand/10 flex items-center justify-center mr-4">
              <Truck className="h-6 w-6 text-green-brand" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Entregador</h3>
              <p className="text-sm text-neutral-500">Realize entregas e ganhe dinheiro</p>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </button>
        </div>
        
        {updateRoleMutation.isPending && (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelectionPage;
