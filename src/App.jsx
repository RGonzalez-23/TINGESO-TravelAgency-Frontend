import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPackages from './pages/AdminPackages';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/packages" element={<AdminPackages />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
