import { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import './css/Profile.css';

const Profile = () => {
  const { keycloak, initialized } = useKeycloak();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!initialized || !keycloak) return;
    if (!keycloak.authenticated) return;
    if (typeof keycloak.loadUserInfo === 'function') {
      keycloak.loadUserInfo()
        .then(info => setUserInfo(info))
        .catch(() => setUserInfo(keycloak.tokenParsed));
    } else {
      setUserInfo(keycloak.tokenParsed);
    }
  }, [initialized, keycloak]);

  if (!initialized) return null;

  if (!keycloak || !keycloak.authenticated) {
    return (
      <div className="container">
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Necesitas iniciar sesión para ver tu perfil</h3>
        </div>
      </div>
    );
  }

  const getField = (name) => {
    if (userInfo && userInfo[name]) return userInfo[name];
    if (keycloak.tokenParsed && keycloak.tokenParsed[name]) return keycloak.tokenParsed[name];
    return '';
  };

  return (
    <div className="container">
      <div className="profile-card glass-card" style={{ padding: '1.5rem', maxWidth: 900, margin: '2rem auto' }}>
        <h2>Mi Perfil</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Nombre(s)</label>
            <div className="form-control-read">{getField('given_name') || getField('preferred_username')}</div>
          </div>
          <div>
            <label className="form-label">Apellido Paterno</label>
            <div className="form-control-read">{getField('first_last_name') || getField('family_name')}</div>
          </div>
          <div>
            <label className="form-label">Apellido Materno</label>
            <div className="form-control-read">{getField('second_last_name') || ''}</div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <div className="form-control-read">{getField('email')}</div>
          </div>
          <div>
            <label className="form-label">Teléfono</label>
            <div className="form-control-read">{getField('phone_number') || getField('phone')}</div>
          </div>
          <div>
            <label className="form-label">Nacionalidad</label>
            <div className="form-control-read">{getField('user_nation') || getField('nationality') || ''}</div>
          </div>
          <div>
            <label className="form-label">RUT</label>
            <div className="form-control-read">{getField('user_rut') || '—'}</div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
          <button className="button button-primary" onClick={() => keycloak.accountManagement()}>Editar en Keycloak</button>
          <button className="button button-outline" onClick={() => {
            if (typeof keycloak.loadUserInfo === 'function') {
              keycloak.loadUserInfo().then(info => setUserInfo(info)).catch(() => setUserInfo(keycloak.tokenParsed));
            }
          }}>Refrescar</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
