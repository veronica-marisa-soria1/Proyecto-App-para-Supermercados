import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Order, Supermarket } from '../types';
import { Package, Clock, CheckCircle, Truck, MapPin, Store, ChevronRight, XCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [supermarkets, setSupermarkets] = useState<Record<string, Supermarket>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
      setOrders(ordersData);

      // Fetch supermarket info for each order
      const supermarketIds = [...new Set(ordersData.map(o => o.supermarketId))];
      const supermarketData: Record<string, Supermarket> = { ...supermarkets };

      for (const id of supermarketIds) {
        if (!supermarketData[id]) {
          const sDoc = await getDoc(doc(db, 'supermarkets', id));
          if (sDoc.exists()) {
            supermarketData[id] = { id: sDoc.id, ...sDoc.data() } as Supermarket;
          }
        }
      }
      setSupermarkets(supermarketData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <div className="py-20 text-center text-gray-500">Cargando tus pedidos...</div>;

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <Package className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Aún no tienes pedidos</h2>
        <p className="text-gray-500 mb-10 text-lg">Tus compras aparecerán aquí una vez que realices tu primer pedido.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Pedidos</h1>
        <span className="text-gray-400 font-medium">{orders.length} pedidos realizados</span>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            supermarket={supermarkets[order.supermarketId]} 
          />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order, supermarket }: { order: Order, supermarket?: Supermarket }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-primary/10 text-primary', icon: <Clock className="w-4 h-4" /> },
    preparing: { label: 'Preparando', color: 'bg-secondary/10 text-secondary', icon: <Package className="w-4 h-4" /> },
    ready: { label: 'Listo para retirar', color: 'bg-accent/10 text-accent', icon: <Store className="w-4 h-4" /> },
    delivered: { label: 'Entregado', color: 'bg-green-100 text-green-600', icon: <CheckCircle className="w-4 h-4" /> },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-600', icon: <XCircle className="w-4 h-4" /> }
  };

  const config = statusConfig[order.status];

  return (
    <motion.div 
      layout
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
      >
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            {supermarket?.logoUrl ? (
              <img src={supermarket.logoUrl} alt={supermarket.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Store className="w-8 h-8 text-orange-200" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{supermarket?.name || 'Supermercado'}</h3>
            <p className="text-gray-400 text-sm font-medium">
              {order.createdAt?.toDate().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6">
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total</p>
            <p className="text-xl font-black text-gray-900">${order.total.toLocaleString()}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-xs font-bold flex items-center space-x-2 ${config.color}`}>
            {config.icon}
            <span>{config.label}</span>
          </div>
          <ChevronRight className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-50 bg-gray-50/50"
          >
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Detalle del Pedido</h4>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 bg-white border border-gray-100 rounded-md flex items-center justify-center text-[10px] font-bold text-gray-400">{item.quantity}x</span>
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <span className="text-gray-900 font-bold">${(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Entrega</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                      {order.deliveryType === 'pickup' ? (
                        <>
                          <Store className="w-4 h-4 text-orange-500" />
                          <span>Retiro en local: {supermarket?.address}</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 text-orange-500" />
                          <span>Envío a domicilio: {order.address}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-start space-x-3">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Si tienes dudas sobre tu pedido, puedes contactar al supermercado al 
                      <span className="font-bold text-gray-700 ml-1">{supermarket?.phone || 'teléfono del local'}</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
