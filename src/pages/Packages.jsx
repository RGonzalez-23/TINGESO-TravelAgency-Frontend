import { useState } from 'react';
import PackageCard from '../components/PackageCard';
import { PACKAGES } from '../data/mockData';
import { Search, Filter } from 'lucide-react';
import './Packages.css';

const Packages = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPackages = PACKAGES.filter(pkg => 
    pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pkg.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="packages-page container fade-in-up">
      <header className="packages-header">
        <h1>Todos los <span className="text-gradient">Paquetes</span></h1>
        <p className="subtitle">Encuentra el destino perfecto para tus próximas vacaciones</p>
      </header>

      <div className="filters-bar glass">
        <div className="search-input-group">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por destino o título..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="button button-outline filter-btn">
          <Filter size={20} /> Filtros
        </button>
      </div>

      <div className="packages-grid">
        {filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => (
            <PackageCard key={pkg.id} item={pkg} />
          ))
        ) : (
          <div className="no-results">
            <h3>No se encontraron resultados</h3>
            <p>Intenta con otros términos de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Packages;
