import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Product } from '@shared/schema';

interface ProductsTableProps {
  products: Product[];
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-neutral-500 text-sm border-b border-neutral-100">
            <th className="pb-3 font-medium">Produto</th>
            <th className="pb-3 font-medium">Categoria</th>
            <th className="pb-3 font-medium">Estoque</th>
            <th className="pb-3 font-medium">Preço</th>
            <th className="pb-3 font-medium">Vendas</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-neutral-100">
              <td className="py-4">
                <div className="flex items-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-10 h-10 rounded-lg object-cover mr-3" 
                    />
                  ) : (
                    <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-neutral-500 text-xs">Sem img</span>
                    </div>
                  )}
                  <span className="font-medium">{product.name}</span>
                </div>
              </td>
              <td className="py-4 text-neutral-500">{product.category}</td>
              <td className={`py-4 ${product.stock <= 5 ? 'text-red-500' : 'text-neutral-500'}`}>
                {product.stock} unid.
              </td>
              <td className="py-4 font-medium">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </td>
              <td className="py-4 text-neutral-500">
                {Math.floor(Math.random() * 200)}
              </td>
              <td className="py-4">
                {product.stock > 0 ? (
                  <span className="px-2 py-1 bg-green-brand/10 text-green-brand rounded-full text-xs">
                    Ativo
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-xs">
                    Sem estoque
                  </span>
                )}
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs ml-1">
                    Baixo estoque
                  </span>
                )}
              </td>
              <td className="py-4">
                <button className="text-neutral-400 hover:text-neutral-700">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
          
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="py-4 text-center text-neutral-500">
                Nenhum produto cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
