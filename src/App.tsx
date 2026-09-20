import { useState, useEffect } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CompareFloatingBar } from './components/CompareFloatingBar';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProjectKitsPage } from './pages/ProjectKitsPage';
import { BuildMyProjectPage } from './pages/BuildMyProjectPage';
import { ComparePage } from './pages/ComparePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { AdminPage } from './pages/AdminPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPrivacyReturnsPage } from './pages/TermsPrivacyReturnsPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname + window.location.search || '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route parser
  const renderRoute = () => {
    const [pathPart, searchPart] = currentPath.split('?');
    const searchParams = new URLSearchParams(searchPart || '');

    // 1. Home
    if (pathPart === '/' || pathPart === '') {
      return <HomePage navigate={navigate} />;
    }

    // 2. Product Details: /products/:id
    const productMatch = pathPart.match(/^\/products\/([^/]+)$/);
    if (productMatch) {
      return <ProductDetailsPage productId={productMatch[1]} navigate={navigate} />;
    }

    // 3. Products Listing (with query params)
    if (pathPart === '/products') {
      const initialParams: any = {};
      if (searchParams.get('category')) initialParams.category = searchParams.get('category')!;
      if (searchParams.get('search')) initialParams.search = searchParams.get('search')!;
      if (searchParams.get('featured')) initialParams.featured = true;
      if (searchParams.get('popular')) initialParams.popular = true;
      return <ProductsPage navigate={navigate} initialParams={initialParams} />;
    }

    // 4. Categories list
    if (pathPart === '/categories') {
      return <CategoriesPage navigate={navigate} />;
    }

    // 5. Project Kits
    if (pathPart === '/project-kits') {
      return <ProjectKitsPage navigate={navigate} />;
    }

    // 6. Build My Project
    if (pathPart === '/build-my-project') {
      return <BuildMyProjectPage navigate={navigate} />;
    }

    // 7. Product Comparison
    if (pathPart === '/compare') {
      return <ComparePage navigate={navigate} />;
    }

    // 8. Checkout
    if (pathPart === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    // 9. Order Details / Tracking: /orders/:id
    const orderMatch = pathPart.match(/^\/orders\/([^/]+)$/);
    if (orderMatch) {
      return <OrderTrackingPage orderId={orderMatch[1]} navigate={navigate} />;
    }

    // 10. Profile / Order history
    if (pathPart === '/profile') {
      return <ProfilePage navigate={navigate} />;
    }

    // 11. Auth (Sign In / Register)
    if (pathPart === '/auth') {
      return <AuthPage navigate={navigate} />;
    }

    // 12. Admin Dashboard
    if (pathPart === '/admin') {
      return <AdminPage navigate={navigate} />;
    }

    // 13. About Page
    if (pathPart === '/about') {
      return <AboutPage navigate={navigate} />;
    }

    // 14. Contact & Store Location
    if (pathPart === '/contact') {
      return <ContactPage navigate={navigate} />;
    }

    // 15. Terms, Policies, & Returns
    if (pathPart === '/terms') {
      return <TermsPrivacyReturnsPage />;
    }

    // Fallback -> Home
    return <HomePage navigate={navigate} />;
  };

  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <CompareProvider>
            <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
              {/* Header */}
              <Header currentPath={currentPath} navigate={navigate} />

              {/* Main App Route View */}
              <main className="flex-1">
                {renderRoute()}
              </main>

              {/* Floating Compare Notification Bar */}
              <CompareFloatingBar navigate={navigate} />

              {/* Slide-out Cart Drawer */}
              <CartDrawer navigate={navigate} />

              {/* Footer */}
              <Footer navigate={navigate} />
            </div>
          </CompareProvider>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
