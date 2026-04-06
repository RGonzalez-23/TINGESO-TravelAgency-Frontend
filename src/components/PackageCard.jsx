import { MapPin, Calendar, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PackageCard.css';

const PackageCard = ({ item }) => {
  return (
    <div className="package-card glass">
      <div className="card-image-wrapper">
        <img src={item.imageUrl} alt={item.title} className="card-image" />
        <div className="card-badge">{item.price} €</div>
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{item.title}</h3>
          <div className="card-rating">
            <Star className="star-icon" size={16} fill="currentColor" />
            <span>{item.rating}</span>
          </div>
        </div>
        <p className="card-desc text-muted">{item.description}</p>
        
        <div className="card-features">
          <div className="feature">
            <MapPin size={16} />
            <span>{item.destination}</span>
          </div>
          <div className="feature">
            <Calendar size={16} />
            <span>{item.duration}</span>
          </div>
          <div className="feature">
            <Users size={16} />
            <span>+{item.people} Personas</span>
          </div>
        </div>
        
        <Link to={`/packages/${item.id}`} className="button button-outline w-full mt-4">
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};

export default PackageCard;
