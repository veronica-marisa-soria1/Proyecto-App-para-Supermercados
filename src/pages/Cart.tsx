import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ShoppingCart, Trash2, MapPin, Package, CreditCard, ArrowRight, Minus, Plus, Store, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { items, removeFromCart, clearCart, total, supermarketId } = useCart();
  const { user, profile, signIn } = useAuth();
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'home_delivery'>('pickup');
  const [address, setAddress] = useState(profile?.address || '');
  const [isOrdering, setIsOrdering] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!user) {
      signIn();
      return;
    }

    if (deliveryType === 'home_delivery' && !address) {
      alert('Por favor ingresa una dirección de entrega.');
      return;
    }

    setIsOrdering(true);
    try {
      const orderData = {
        userId: user.uid,
        supermarketId,
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        total,
        status: 'pending',
        deliveryType,
        address: deliveryType === 'home_delivery' ? address : null,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
    } finally {
      setIsOrdering(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingCart className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-10 text-lg">Parece que aún no has agregado nada. ¡Explora las ofertas de hoy!</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-95"
        >
          Explorar Supermercados
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Items List */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tu Carrito</h1>
          <button 
            onClick={clearCart}
            className="text-gray-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Vaciar Carrito</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {items.map((item) => (
              <motion.div 
                layout
                key={item.productId} 
                className="p-6 flex items-center space-x-6"
              >
                <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-orange-200" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                  <p className="text-orange-500 font-bold">${item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right mr-4">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Subtotal</p>
                    <p className="font-bold text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary & Checkout */}
      <div className="space-y-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Resumen de Compra</h2>
          
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">${total.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Envío</span>
              <span className="text-green-500 font-bold">Gratis</span>
            </div>
            <div className="border-t border-gray-50 pt-6 flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-3xl font-black text-orange-500">${total.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Método de Entrega</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeliveryType('pickup')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  deliveryType === 'pickup' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                <Store className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">Retiro</span>
              </button>
              <button 
                onClick={() => setDeliveryType('home_delivery')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  deliveryType === 'home_delivery' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                <Truck className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">Envío</span>
              </button>
            </div>
          </div>

          {deliveryType === 'home_delivery' && (
            <div className="mb-8 space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dirección de Entrega</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Tu dirección en Chaco..." 
                  className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          )}

          <button 
            onClick={handlePlaceOrder}
            disabled={isOrdering}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-3 active:scale-95 ${
              isOrdering ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-primary/20'
            }`}
          >
            {isOrdering ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <>
                <span>Realizar Pedido</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          
          <p className="text-center text-[10px] text-gray-400 mt-6 leading-relaxed">
            Al realizar el pedido, aceptas que el supermercado reciba tus datos de contacto para coordinar la entrega.
          </p>
        </div>
      </div>
    </div>
  );
}
