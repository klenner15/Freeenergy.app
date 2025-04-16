import React from 'react';
import { Check, User, Truck, ShoppingBag } from 'lucide-react';

interface OrderStatusStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  active: boolean;
}

interface OrderStatusProps {
  status: string;
  statusHistory: {
    status: string;
    timestamp: Date;
    description: string;
  }[];
}

const OrderStatus: React.FC<OrderStatusProps> = ({ status, statusHistory }) => {
  // Convert status to steps
  const getSteps = (): OrderStatusStep[] => {
    const steps: OrderStatusStep[] = [
      {
        title: "Pedido confirmado",
        description: getStepDescription("pending"),
        icon: <Check className="h-4 w-4" />,
        completed: ["pending", "confirmed", "preparing", "ready", "delivering", "delivered"].includes(status),
        active: status === "pending"
      },
      {
        title: "Em preparação",
        description: getStepDescription("preparing"),
        icon: <ShoppingBag className="h-4 w-4" />,
        completed: ["preparing", "ready", "delivering", "delivered"].includes(status),
        active: status === "preparing"
      },
      {
        title: "Saiu para entrega",
        description: getStepDescription("delivering"),
        icon: <Truck className="h-4 w-4" />,
        completed: ["delivering", "delivered"].includes(status),
        active: status === "delivering"
      },
      {
        title: "Pedido entregue",
        description: getStepDescription("delivered"),
        icon: <Check className="h-4 w-4" />,
        completed: status === "delivered",
        active: status === "delivered"
      }
    ];
    
    return steps;
  };
  
  // Get description and time for a step from status history
  const getStepDescription = (stepStatus: string): string => {
    const historyItem = statusHistory.find(item => item.status === stepStatus);
    
    if (!historyItem) {
      return "Aguardando";
    }
    
    const time = new Date(historyItem.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${time} - ${historyItem.description}`;
  };
  
  const steps = getSteps();
  
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div className="flex" key={index}>
          <div className="flex flex-col items-center mr-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step.completed || step.active
                ? 'bg-primary text-white'
                : 'bg-neutral-200 text-white'
            } ${step.active ? 'animate-pulse' : ''}`}>
              {step.icon}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-0.5 h-full mt-1 ${
                step.completed ? 'bg-primary' : 'bg-neutral-200'
              }`}></div>
            )}
          </div>
          <div className="flex-1">
            <h5 className={`font-medium text-sm ${
              step.completed || step.active ? '' : 'text-neutral-400'
            }`}>{step.title}</h5>
            <p className="text-xs text-neutral-500 mt-0.5">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStatus;
