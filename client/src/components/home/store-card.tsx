import React from 'react';
import { Link } from 'wouter';
import { Clock, MapPin } from 'lucide-react';
import { Store } from '@shared/schema';

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  return (
    <Link href={`/store/${store.id}`}>
      <a className="block bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        {store.coverUrl ? (
          <img 
            src={store.coverUrl} 
            alt={store.name} 
            className="w-full h-32 object-cover" 
          />
        ) : (
          <div className="w-full h-32 bg-neutral-200 flex items-center justify-center">
            <span className="text-neutral-500">Sem imagem</span>
          </div>
        )}
        
        <div className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{store.name}</h3>
              <p className="text-xs text-neutral-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{store.latitude && store.longitude ? `${(Math.random() * 3).toFixed(1)} km de distância` : store.address}</span>
              </p>
            </div>
            <div className="flex items-center bg-green-brand/10 text-green-brand rounded px-2 py-1 text-xs font-medium">
              <Clock className="h-3 w-3 mr-1" />
              <span>{store.deliveryTime || '15-25 min'}</span>
            </div>
          </div>
          
          {store.tags && store.tags.length > 0 && (
            <div className="flex items-center mt-2 text-xs">
              {store.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-neutral-100 rounded-full px-2 py-1 mr-2"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </a>
    </Link>
  );
};

export default StoreCard;
