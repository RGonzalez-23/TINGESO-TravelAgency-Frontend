import { Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Packages from './pages/user/Packages';
import PackageDetails from './pages/user/PackageDetails';
import AdminPackages from './pages/admin/AdminPackages';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserEdit from './pages/admin/AdminUserEdit';
import BookPackage from './pages/user/BookPackage';
import Checkout from './pages/user/Checkout';
import PaymentSuccess from './pages/user/PaymentSuccess';
import MyReservations from './pages/user/MyReservations';
import VoucherDocument from './pages/user/VoucherDocument';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminConfig from './pages/admin/AdminConfig';
import AdminReservations from './pages/admin/AdminReservations';
import AdminReports from './pages/admin/AdminReports';
import AdminPromotions from './pages/admin/AdminPromotions';
import Profile from './pages/user/Profile';
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
  return <Home />;
}

function App() {
  return (
    <div className="app-container">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeWrapper />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetails />} />
          <Route path="/packages/:id/book" element={<RequireRole roles={["CLIENTE"]}><BookPackage /></RequireRole>} />
          <Route path="/checkout/:id" element={<RequireRole roles={["CLIENTE"]}><Checkout /></RequireRole>} />
          <Route path="/checkout/success/:id" element={<RequireRole roles={["CLIENTE"]}><PaymentSuccess /></RequireRole>} />
          <Route path="/my-reservations" element={<RequireRole roles={["CLIENTE"]}><MyReservations /></RequireRole>} />
          <Route path="/receipt/:id" element={<RequireRole roles={["CLIENTE", "ADMIN"]}><VoucherDocument /></RequireRole>} />
          <Route path="/profile" element={<RequireRole roles={["CLIENTE","ADMIN"]}><Profile /></RequireRole>} />
          <Route path="/admin/dashboard" element={<RequireRole roles={["ADMIN"]}><AdminDashboard /></RequireRole>} />
          <Route path="/admin/packages" element={<RequireRole roles={["ADMIN"]}><AdminPackages /></RequireRole>} />
          <Route path="/admin/users" element={<RequireRole roles={["ADMIN"]}><AdminUsers /></RequireRole>} />
          <Route path="/admin/users/:id" element={<RequireRole roles={["ADMIN"]}><AdminUserEdit /></RequireRole>} />
          <Route path="/admin/discounts" element={<RequireRole roles={["ADMIN"]}><AdminConfig /></RequireRole>} />
          <Route path="/admin/promotions" element={<RequireRole roles={["ADMIN"]}><AdminPromotions /></RequireRole>} />
          <Route path="/admin/reservations" element={<RequireRole roles={["ADMIN"]}><AdminReservations /></RequireRole>} />
          <Route path="/admin/reports" element={<RequireRole roles={["ADMIN"]}><AdminReports /></RequireRole>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
