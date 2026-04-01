import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Supermarket, Product, Offer } from '../types';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, MapPin, Phone, Info, Tag, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function SupermarketDetail() {
  const { id } = useParams<{ id: string }>();
  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    const fetchSupermarket = async () => {
      const docRef = doc(db, 'supermarkets', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSupermarket({ id: docSnap.id, ...docSnap.data() } as Supermarket);
      }
    };

    fetchSupermarket();

    const productsUnsubscribe = onSnapshot(collection(db, 'supermarkets', id, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
    });

    const offersUnsubscribe = onSnapshot(collection(db, 'supermarkets', id, 'offers'), (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Offer[]);
      setLoading(false);
    });

    return () => {
      productsUnsubscribe();
      offersUnsubscribe();
    };
  }, [id]);

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="py-20 text-center text-gray-500">Cargando supermercado...</div>;
  if (!supermarket) return <div className="py-20 text-center text-gray-500">Supermercado no encontrado.</div>;

  return (
    <div className="space-y-8">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>Volver a supermercados</span>
      </Link>

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 bg-primary/5 rounded-2xl flex-shrink-0 overflow-hidden">
          {supermarket.logoUrl ? (
            <img src={supermarket.logoUrl} alt={supermarket.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-12 h-12 text-primary/20" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{supermarket.name}</h1>
          <p className="text-gray-500 mb-6 max-w-2xl">{supermarket.description}</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-gray-400 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{supermarket.address}</span>
            </div>
            {supermarket.phone && (
              <div className="flex items-center text-gray-400 text-sm">
                <Phone className="w-4 h-4 mr-2" />
                <span>{supermarket.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-40 bg-gray-50/80 backdrop-blur-md py-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            className="w-full bg-white border border-gray-200 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <Filter className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat === 'all' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Section */}
      {offers.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <Tag className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Ofertas Imperdibles</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map(offer => {
              const product = products.find(p => p.id === offer.productId);
              if (!product) return null;
              return (
                <ProductCard 
                  key={offer.id} 
                  product={product} 
                  offer={offer} 
                  onAddToCart={addToCart} 
                />
              );
            })}
          </div>
        </section>
      )}

      {/* All Products */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">Todos los Productos</h2>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const offer = offers.find(o => o.productId === product.id);
              return (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  offer={offer} 
                  onAddToCart={addToCart} 
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Info className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No se encontraron productos en esta categoría.</p>
          </div>
        )}
      </section>
    </div>
  );
}
