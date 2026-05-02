import { MapPin, Calendar, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PackageCard.css';

const PackageCard = ({ item }) => {
  return (
    <div className={`package-card glass ${item.status === 'AGOTADO' ? 'agotado' : ''}`}>
      <div className="card-image-wrapper">
        <img
          //src={item.imageUrl || `https://source.unsplash.com/800x600/?${item.destination.replace(' ', '+')}`}
          //alt={item.name}
          //className="card-image"
          style={{ opacity: item.status === 'AGOTADO' ? 0.6 : 1 }}
        />
        <div className="card-badge">${item.price.toLocaleString('es-CL')} CLP</div>
        {item.status === 'AGOTADO' && (
          <div className="card-badge-soldout" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'red', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem', zIndex: 10 }}>
            AGOTADO
          </div>
        )}
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title" style={{ color: '#cdccccff' }}>{item.name}</h3>
          <div className="card-rating">
            <Star className="star-icon" size={16} fill="currentColor" />
            <span>4.9</span>
          </div>
        </div>
        <p className="card-desc text-muted">{item.description.substring(0, 100)}...</p>

        <div className="card-features">
          <div className="feature">
            <MapPin size={16} />
            <span>{item.destination}</span>
          </div>
          <div className="feature">
            <Calendar size={16} />
            <span>{item.durationDays} Días</span>
          </div>
          <div className="feature">
            <Users size={16} />
            <span>{item.availableSlots} Cupos Libres</span>
          </div>
        </div>

        <Link to={`/packages/${item.id}`} className={`button w-full mt-4 ${item.status === 'AGOTADO' ? 'button-secondary' : 'button-outline'}`}>
          {item.status === 'AGOTADO' ? 'Ver Detalles' : 'Ver y Reservar'}
        </Link>
      </div>
    </div>
  );
};

export default PackageCard;
