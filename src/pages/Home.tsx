import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Supermarket, Offer, Product } from '../types';
import SupermarketCard from '../components/SupermarketCard';
import { Search, Tag, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'supermarkets'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Supermarket[];
      setSupermarkets(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredSupermarkets = supermarkets.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-primary p-8 md:p-16 text-white">
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-6">
              📍 Chaco, Argentina
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Tus supermercados <br /> favoritos en un solo lugar.
            </h1>
            <p className="text-white/80 text-lg mb-10 max-w-lg">
              Encuentra las mejores ofertas diarias, semanales y mensuales de los comercios locales de tu ciudad.
            </p>
            
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar supermercado..." 
                className="w-full bg-white text-gray-900 pl-12 pr-4 py-4 rounded-2xl shadow-xl focus:ring-4 focus:ring-secondary transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
          <StoreIllustration className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 text-white/10" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<Clock className="w-6 h-6 text-primary" />}
          title="Ofertas Diarias"
          description="Descuentos exclusivos que cambian cada 24 horas."
        />
        <FeatureCard 
          icon={<TrendingUp className="w-6 h-6 text-secondary" />}
          title="Ahorro Semanal"
          description="Planifica tus compras con las mejores promociones de la semana."
        />
        <FeatureCard 
          icon={<Sparkles className="w-6 h-6 text-accent" />}
          title="Precios del Mes"
          description="Ofertas duraderas para que tu presupuesto rinda más."
        />
      </section>

      {/* Supermarkets List */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Supermercados Locales</h2>
          <span className="text-gray-400 font-medium">{filteredSupermarkets.length} comercios</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredSupermarkets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSupermarkets.map((supermarket) => (
              <SupermarketCard key={supermarket.id} supermarket={supermarket} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No encontramos supermercados con ese nombre.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-orange-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function StoreIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
