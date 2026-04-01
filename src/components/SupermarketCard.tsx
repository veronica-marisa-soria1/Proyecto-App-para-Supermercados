import { Link } from 'react-router-dom';
import { MapPin, Phone, ArrowRight } from 'lucide-react';
import { Supermarket } from '../types';
import { motion } from 'motion/react';

interface Props {
  supermarket: Supermarket;
}

export default function SupermarketCard({ supermarket }: Props) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {supermarket.logoUrl ? (
          <img 
            src={supermarket.logoUrl} 
            alt={supermarket.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <MapPin className="w-12 h-12 text-primary/20" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{supermarket.name}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{supermarket.description || 'Sin descripción disponible.'}</p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-400 text-xs">
            <MapPin className="w-3.5 h-3.5 mr-2" />
            <span className="truncate">{supermarket.address}</span>
          </div>
          {supermarket.phone && (
            <div className="flex items-center text-gray-400 text-xs">
              <Phone className="w-3.5 h-3.5 mr-2" />
              <span>{supermarket.phone}</span>
            </div>
          )}
        </div>

        <Link 
          to={`/supermarket/${supermarket.id}`}
          className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-primary transition-colors group"
        >
          <span>Ver Ofertas</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
