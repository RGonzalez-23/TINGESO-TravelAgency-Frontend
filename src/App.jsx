import { Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Packages from './pages/user/Packages';
import PackageDetails from './pages/user/PackageDetails';
import AdminPackages from './pages/admin/AdminPackages';
import BookPackage from './pages/user/BookPackage';
import Checkout from './pages/user/Checkout';
import MyReservations from './pages/user/MyReservations';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminConfig from './pages/admin/AdminConfig';
import './App.css';

function RequireRole({ children, roles = [] }) {
  const { keycloak, initialized } = useKeycloak();
  if (!initialized) return null;
  if (!roles || roles.length === 0) return children;
  if (!keycloak?.authenticated) return <Navigate to="/" replace />;
  const tokenRoles = keycloak?.tokenParsed?.realm_access?.roles || [];
  const hasRole = roles.some(r => {
    try {
      if (keycloak.hasRealmRole && keycloak.hasRealmRole(r)) return true;
    } catch (e) {}
    return tokenRoles.includes(r);
  });
  if (!hasRole) return <Navigate to="/" replace />;
  return children;
}

function HomeWrapper() {
  const { keycloak, initialized } = useKeycloak();
  if (!initialized) return null;
  if (!keycloak?.authenticated) return <Home />;
  const tokenRoles = keycloak?.tokenParsed?.realm_access?.roles || [];
  if (tokenRoles.includes('ADMIN')) return <Navigate to="/admin/dashboard" replace />;
  if (tokenRoles.includes('CLIENTE')) return <Navigate to="/packages" replace />;
  return <Home />;
}

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeWrapper />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetails />} />
          <Route path="/packages/:id/book" element={<RequireRole roles={["CLIENTE"]}><BookPackage /></RequireRole>} />
          <Route path="/checkout/:id" element={<RequireRole roles={["CLIENTE"]}><Checkout /></RequireRole>} />
          <Route path="/my-reservations" element={<RequireRole roles={["CLIENTE"]}><MyReservations /></RequireRole>} />
          <Route path="/admin/dashboard" element={<RequireRole roles={["ADMIN"]}><AdminDashboard /></RequireRole>} />
          <Route path="/admin/packages" element={<RequireRole roles={["ADMIN"]}><AdminPackages /></RequireRole>} />
          <Route path="/admin/discounts" element={<RequireRole roles={["ADMIN"]}><AdminConfig /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
