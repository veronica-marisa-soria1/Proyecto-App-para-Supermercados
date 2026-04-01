import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { Supermarket, Product, Offer, Order } from '../types';
import { Plus, Edit2, Trash2, Tag, Package, Store, ChevronRight, CheckCircle, XCircle, Clock, LayoutDashboard, Settings, ShoppingBag, PlusCircle, Image as ImageIcon, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const { user, profile } = useAuth();
  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'offers' | 'orders' | 'settings'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);

  // Form states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<{ name: string; description: string; price: number; category: string; imageUrl: string; stock: number }>({ name: '', description: '', price: 0, category: '', imageUrl: '', stock: 0 });

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'supermarkets'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const sData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Supermarket;
        setSupermarket(sData);

        // Fetch related data
        onSnapshot(collection(db, 'supermarkets', sData.id, 'products'), (pSnap) => {
          setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);
        });
        onSnapshot(collection(db, 'supermarkets', sData.id, 'offers'), (oSnap) => {
          setOffers(oSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Offer[]);
        });
        onSnapshot(query(collection(db, 'orders'), where('supermarketId', '==', sData.id)), (ordSnap) => {
          setOrders(ordSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[]);
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supermarket) return;

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'supermarkets', supermarket.id, 'products', editingProduct.id), productForm);
      } else {
        await addDoc(collection(db, 'supermarkets', supermarket.id, 'products'), {
          ...productForm,
          supermarketId: supermarket.id
        });
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setProductForm({ name: '', description: '', price: 0, category: '', imageUrl: '', stock: 0 });
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const bootstrapData = async () => {
    if (!supermarket) return;
    const testProducts = [
      { name: 'Leche Entera 1L', description: 'Leche fresca de campo', price: 1200, category: 'Lácteos', stock: 50 },
      { name: 'Pan Felipe x kg', description: 'Recién horneado', price: 1500, category: 'Panadería', stock: 100 },
      { name: 'Yerba Mate 500g', description: 'Sabor tradicional', price: 2500, category: 'Almacén', stock: 30 },
      { name: 'Aceite de Girasol 1.5L', description: 'Primera prensada', price: 3200, category: 'Almacén', stock: 20 }
    ];

    for (const p of testProducts) {
      await addDoc(collection(db, 'supermarkets', supermarket.id, 'products'), {
        ...p,
        supermarketId: supermarket.id,
        imageUrl: `https://picsum.photos/seed/${p.name}/400/300`
      });
    }
    alert('Datos de prueba cargados con éxito.');
  };

  const bootstrapExampleSupermarkets = async () => {
    if (!user) return;
    const examples = [
      { name: 'Supermercados Juan Carlos', address: 'Av. San Martín 450, Chaco', description: 'Tradición y calidad en cada compra. Los mejores cortes de carne de la región.', logoUrl: 'https://picsum.photos/seed/juancarlos/400/400' },
      { name: 'MiniMax', address: 'Belgrano 120, Chaco', description: 'Tu compra rápida y al mejor precio. Siempre cerca de tu hogar.', logoUrl: 'https://picsum.photos/seed/minimax/400/400' },
      { name: 'El Loco de las ofertas', address: 'Calle 12 esq. 5, Chaco', description: '¡Precios de locura! Ofertas imbatibles todos los días en almacén y limpieza.', logoUrl: 'https://picsum.photos/seed/elloco/400/400' },
      { name: 'Mariano Idelio Santos', address: 'Rivadavia 890, Chaco', description: 'Variedad y frescura garantizada. Frutas y verduras seleccionadas diariamente.', logoUrl: 'https://picsum.photos/seed/marianosantos/400/400' }
    ];

    try {
      for (const ex of examples) {
        const sRef = await addDoc(collection(db, 'supermarkets'), {
          ...ex,
          ownerId: user.uid
        });
        
        // Add some products to each
        const products = [
          { name: 'Aceite 900ml', price: 1800, category: 'Almacén', stock: 100, description: 'Aceite de girasol de primera calidad' },
          { name: 'Arroz 1kg', price: 950, category: 'Almacén', stock: 200, description: 'Arroz largo fino' },
          { name: 'Fideos 500g', price: 850, category: 'Almacén', stock: 150, description: 'Fideos tallarines' }
        ];
        
        for (const p of products) {
          await addDoc(collection(db, 'supermarkets', sRef.id, 'products'), {
            ...p,
            supermarketId: sRef.id,
            imageUrl: `https://picsum.photos/seed/${p.name}-${sRef.id}/400/300`
          });
        }
      }
      alert('Supermercados de ejemplo cargados con éxito.');
      window.location.reload();
    } catch (error) {
      console.error('Error bootstrapping examples:', error);
      alert('Error al cargar ejemplos.');
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-500">Cargando panel...</div>;

  const createSupermarket = async () => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'supermarkets'), {
        name: 'Mi Supermercado',
        address: 'Calle Falsa 123, Chaco',
        ownerId: user.uid,
        description: 'Bienvenido a nuestro supermercado local.',
        logoUrl: 'https://picsum.photos/seed/supermarket/400/400'
      });
      // Update user role to owner if not already
      await updateDoc(doc(db, 'users', user.uid), { role: 'owner' });
      window.location.reload();
    } catch (error) {
      console.error('Error creating supermarket:', error);
    }
  };

  if (!supermarket) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Store className="w-16 h-16 text-primary/20 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Crea tu Supermercado</h2>
        <p className="text-gray-500 mb-10 text-lg">Aún no tienes un supermercado registrado. ¡Comienza ahora!</p>
        <button 
          onClick={createSupermarket}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-95"
        >
          Dar de Alta mi Comercio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Sidebar */}
      <aside className="lg:w-64 space-y-2">
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm mb-8 text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
            {supermarket.logoUrl ? (
              <img src={supermarket.logoUrl} alt={supermarket.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Store className="w-8 h-8 text-primary/20" />
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-sm">{supermarket.name}</h3>
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Dueño</p>
        </div>

        <AdminNavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard className="w-5 h-5" />} label="Resumen" />
        <AdminNavItem active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<ShoppingBag className="w-5 h-5" />} label="Pedidos" count={orders.filter(o => o.status === 'pending').length} />
        <AdminNavItem active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Package className="w-5 h-5" />} label="Productos" />
        <AdminNavItem active={activeTab === 'offers'} onClick={() => setActiveTab('offers')} icon={<Tag className="w-5 h-5" />} label="Ofertas" />
        <AdminNavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-5 h-5" />} label="Configuración" />
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Resumen General</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Pedidos Pendientes" value={orders.filter(o => o.status === 'pending').length} color="bg-primary" />
                <StatCard label="Productos Activos" value={products.length} color="bg-secondary" />
                <StatCard label="Ofertas Vigentes" value={offers.length} color="bg-accent" />
              </div>
              
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Últimos Pedidos</h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                          <ShoppingBag className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Pedido #{order.id.slice(-4)}</p>
                          <p className="text-xs text-gray-400 font-medium">${order.total.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Productos</h2>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowOnlyInStock(!showOnlyInStock)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                      showOnlyInStock 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span>{showOnlyInStock ? 'Ver Todos' : 'Solo con Stock'}</span>
                  </button>
                  <button 
                    onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: 0, category: '', imageUrl: '', stock: 0 }); setIsProductModalOpen(true); }}
                    className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Nuevo Producto</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products
                  .filter(product => !showOnlyInStock || (product.stock && product.stock > 0))
                  .map(product => (
                  <div key={product.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-primary/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                      <p className="text-primary font-bold text-sm">${product.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => { 
                          setEditingProduct(product); 
                          setProductForm({ 
                            name: product.name, 
                            description: product.description || '', 
                            price: product.price, 
                            category: product.category || '', 
                            imageUrl: product.imageUrl || '', 
                            stock: product.stock || 0 
                          }); 
                          setIsProductModalOpen(true); 
                        }}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteDoc(doc(db, 'supermarkets', supermarket.id, 'products', product.id))}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Pedidos</h2>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-bold text-gray-900">Pedido #{order.id.slice(-4)}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-primary/10 text-primary' : 
                          order.status === 'ready' ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs font-medium">
                        {order.items.length} productos • Total: ${order.total.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                          className="bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all"
                        >
                          Preparar
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                          className="bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-600 transition-all"
                        >
                          Listo
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button 
                          onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                          className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-all"
                        >
                          Entregado
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Configuración</h2>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Herramientas de Desarrollador</h3>
                  <p className="text-gray-500 text-sm mb-6">Usa estas herramientas para probar la aplicación.</p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={bootstrapData}
                      className="bg-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                    >
                      Cargar Productos de Prueba
                    </button>
                    <button 
                      onClick={bootstrapExampleSupermarkets}
                      className="bg-primary/10 text-primary px-6 py-3 rounded-2xl font-bold hover:bg-primary/20 transition-all"
                    >
                      Cargar Supermercados de Ejemplo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSaveProduct} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Precio</label>
                    <input 
                      required
                      type="number" 
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">URL Imagen</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descripción</label>
                  <textarea 
                    className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all h-24 resize-none"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-primary/90 transition-all active:scale-95"
                >
                  {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminNavItem({ active, onClick, icon, label, count }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, count?: number }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${
        active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-4">
        {icon}
        <span className="font-bold text-sm tracking-tight">{label}</span>
      </div>
      {count !== undefined && count > 0 && (
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
          active ? 'bg-white text-primary' : 'bg-primary text-white'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-4xl font-black ${color.replace('bg-', 'text-')}`}>{value}</p>
    </div>
  );
}
