import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from './types';
import { ShoppingCart, Store, User as UserIcon, LogOut, Package, Search, MapPin, Tag, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Context for Auth
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Components
import Home from './pages/Home';
import SupermarketDetail from './pages/SupermarketDetail';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Cart from './pages/Cart';

function Navbar() {
  const { user, profile, signIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Chaco Market</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-primary font-medium transition-colors">Supermercados</Link>
            {user && (
              <Link to="/orders" className="text-gray-600 hover:text-primary font-medium transition-colors">Mis Pedidos</Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {profile?.role === 'owner' && (
              <Link 
                to="/admin" 
                className="hidden sm:flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/20 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel Dueño</span>
              </Link>
            )}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {/* Cart count would go here */}
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-gray-200" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user.displayName?.split(' ')[0]}</span>
                </button>
                
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-xs text-gray-400 uppercase font-semibold">Rol: {profile?.role}</p>
                      </div>
                      {profile?.role === 'owner' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsMenuOpen(false)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 border-b border-gray-50"
                        >
                          <LayoutDashboard className="w-4 h-4 text-primary" />
                          <span>Panel Dueño</span>
                        </Link>
                      )}
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                Ingresar
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import { CartProvider } from './context/CartContext';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            role: 'customer'
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center"
        >
          <Store className="w-12 h-12 text-primary mb-4" />
          <p className="text-gray-500 font-medium">Cargando Chaco Market...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
              <Navbar />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/supermarket/:id" element={<SupermarketDetail />} />
                  <Route path="/orders" element={user ? <Orders /> : <Navigate to="/" />} />
                  <Route path="/admin" element={profile?.role === 'owner' ? <Admin /> : <Navigate to="/" />} />
                  <Route path="/cart" element={<Cart />} />
                </Routes>
              </main>
              
              <footer className="bg-white border-t border-gray-100 py-12 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Store className="w-6 h-6 text-primary" />
                        <span className="text-xl font-bold text-gray-900">Chaco Market</span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        Conectando los supermercados de tu ciudad con tu hogar. 
                        Las mejores ofertas de Chaco en un solo lugar.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Ciudad</h3>
                      <p className="text-gray-500 text-sm flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Chaco, Argentina</span>
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-4">Contacto</h3>
                      <p className="text-gray-500 text-sm">soporte@chacomarket.com.ar</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-50 mt-12 pt-8 text-center text-gray-400 text-xs">
                    © 2026 Chaco Market. Todos los derechos reservados.
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </CartProvider>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}
