import { ShoppingCart, Tag, Info, ArrowLeft, Plus, Minus, Package, Clock, Calendar, Star } from 'lucide-react';
import { Product, Offer } from '../types';
import { motion } from 'motion/react';
import { useState } from 'react';

interface Props {
  product: Product;
  offer?: Offer;
  onAddToCart: (product: Product, quantity: number, offer?: Offer) => void;
}

export default function ProductCard({ product, offer, onAddToCart }: Props) {
  const [quantity, setQuantity] = useState(1);
  const currentPrice = offer ? offer.discountedPrice : product.price;
  const hasDiscount = offer !== undefined;
  const discountPercent = hasDiscount ? Math.round((1 - offer.discountedPrice / product.price) * 100) : 0;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col"
    >
      <div className="h-48 bg-gray-50 relative overflow-hidden group">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50">
            <Package className="w-12 h-12 text-orange-200" />
          </div>
        )}
        
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>-{discountPercent}%</span>
          </div>
        )}

        {offer?.type && (
          <div className={`absolute top-3 right-3 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg uppercase tracking-wider ${
            offer.type === 'daily' ? 'bg-orange-500' : 
            offer.type === 'weekly' ? 'bg-blue-500' : 'bg-purple-500'
          }`}>
            {offer.type === 'daily' ? 'Hoy' : offer.type === 'weekly' ? 'Semana' : 'Mes'}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
          <p className="text-gray-400 text-xs line-clamp-2 min-h-[32px]">{product.description || 'Sin descripción.'}</p>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline space-x-2 mb-4">
            <span className="text-2xl font-black text-gray-900">${currentPrice.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">${product.price.toLocaleString()}</span>
            )}
          </div>

          <div className="flex items-center justify-between space-x-3">
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-500"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-gray-700">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-500"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={() => onAddToCart(product, quantity, offer)}
              className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
