import { useState, useEffect } from 'react';
import PackageCard from '../../components/PackageCard';
import { Search, Filter, X } from 'lucide-react';
import { useKeycloak } from '@react-keycloak/web';
import { Link } from 'react-router-dom';
import './css/Packages.css';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    destination: '',
    minPrice: '',
    maxPrice: '',
    dateFrom: '',
    dateTo: '',
    category: '',
    minDuration: '',
    maxDuration: ''
  });

  const categories = ['AVENTURA', 'RELAX', 'CULTURAL', 'FAMILIAR', 'ROMANTICO', 'NEGOCIOS', 'DEPORTIVO'];

  // Cargar paquetes al montar el componente (sin filtros = devuelve todos los válidos)
  useEffect(() => {
    fetchPackages(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { keycloak, initialized } = useKeycloak();
  const isAdmin = initialized && keycloak && ((keycloak.hasRealmRole && keycloak.hasRealmRole('ADMIN')) || (keycloak.tokenParsed?.realm_access?.roles || []).includes('ADMIN'));

  const fetchPackages = async (currentFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key]) {
          params.append(key, currentFilters[key]);
        }
      });

      const response = await fetch(`/api/packages/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error("Error obteniendo paquetes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPackages(filters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      destination: '', minPrice: '', maxPrice: '',
      dateFrom: '', dateTo: '', category: '',
      minDuration: '', maxDuration: ''
    };
    setFilters(emptyFilters);
    fetchPackages(emptyFilters);
  };

  return (
    <div className="packages-page container fade-in-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5rem' }}>
        <header className="packages-header">
          <h1>Encuentra tu próximo <span className="text-gradient">Destino</span></h1>
          <p className="subtitle">Explora los mejores paquetes turísticos</p>
        </header>
        {isAdmin && (
          <div style={{ marginLeft: '1rem' }}>
            <Link to="/admin/packages" className="button button-outline">Administrar Paquetes</Link>
          </div>
        )}
      </div>

      {/* Barra de bśsqueda general */}
      <form className="filters-bar glass" onSubmit={handleSearch}>
        <div className="search-input-group" style={{ flex: 1 }}>
          <Search size={20} className="search-icon" />
          <input
            type="text"
            name="destination"
            placeholder="¿A dónde quieres ir? (Ej. Paris)"
            className="search-input"
            value={filters.destination}
            onChange={handleInputChange}
          />
        </div>
        <button type="button" className={`button ${showFilters ? 'button-primary' : 'button-outline'}`} onClick={() => setShowFilters(!showFilters)}>
          <Filter size={20} /> Filtros Avanzados
        </button>
        <button type="submit" className="button button-primary">Buscar</button>
      </form>

      {/* Panel de filtros avanzados (Acordeón) */}
      {showFilters && (
        <div className="advanced-filters glass fade-in" style={{ padding: '2rem', marginTop: '1rem', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          <div className="filter-group">
            <label>Precio Mínimo (CLP)</label>
            <input type="number" name="minPrice" className="form-input" value={filters.minPrice} onChange={handleInputChange} placeholder="0" />
          </div>
          
          <div className="filter-group">
            <label>Precio Máximo (CLP)</label>
            <input type="number" name="maxPrice" className="form-input" value={filters.maxPrice} onChange={handleInputChange} placeholder="9000000" />
          </div>

          <div className="filter-group">
            <label>Desde Fecha</label>
            <input type="date" name="dateFrom" className="form-input" value={filters.dateFrom} onChange={handleInputChange} />
          </div>

          <div className="filter-group">
            <label>Hasta Fecha</label>
            <input type="date" name="dateTo" className="form-input" value={filters.dateTo} onChange={handleInputChange} />
          </div>

          <div className="filter-group">
            <label>Duración Mín. (Días)</label>
            <input type="number" name="minDuration" className="form-input" value={filters.minDuration} onChange={handleInputChange} placeholder="0" />
          </div>
          
          <div className="filter-group">
            <label>Duración Máx. (Días)</label>
            <input type="number" name="maxDuration" className="form-input" value={filters.maxDuration} onChange={handleInputChange} placeholder="30" />
          </div>

          <div className="filter-group">
            <label>Tipo de Experiencia</label>
            <select name="category" className="form-input" value={filters.category} onChange={handleInputChange}>
              <option value="">Cualquiera</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="button" className="button button-secondary" onClick={handleClearFilters} style={{ width: '100%' }}>
              <X size={16} /> Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Rejilla de Paquetes */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h3>Buscando aventuras...</h3>
        </div>
      ) : (
        <div className="packages-grid" style={{ marginTop: '3rem' }}>
          {packages.length > 0 ? (
            packages.map((pkg) => (
              <PackageCard key={pkg.id} item={pkg} />
            ))
          ) : (
            <div className="no-results" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              <h3>No se encontraron resultados</h3>
              <p>Ningún paquete coincide con esos filtros tan estrictos. ¡Intenta ser más flexible!</p>
              <button className="button button-primary" style={{ marginTop: '1rem' }} onClick={handleClearFilters}>
                Ver todos los paquetes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Packages;
