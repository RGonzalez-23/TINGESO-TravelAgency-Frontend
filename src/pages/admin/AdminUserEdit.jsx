import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const AdminUserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { keycloak, initialized } = useKeycloak();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', rut: '', nacionalidad: '', enabled: true });

  const deriveAdminBase = () => {
    const iss = keycloak?.tokenParsed?.iss;
    if (iss && iss.includes('/realms/')) {
      const base = iss.split('/realms')[0];
      const realm = iss.split('/realms/')[1];
      return { base, realm };
    }
    return { base: 'http://localhost:8080', realm: 'travel-realm' };
  };

  const fetchUser = async () => {
    if (!initialized || !keycloak || !keycloak.authenticated) return;
    setLoading(true); setError(null);
    try {
      await keycloak.updateToken(10).catch(() => {});
      const { base, realm } = deriveAdminBase();
      
      // 1. Obtener datos básicos del usuario
      const userUrl = `${base}/admin/realms/${realm}/users/${id}`;
      const res = await fetch(userUrl, { headers: { Authorization: `Bearer ${keycloak.token}` } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      // 2. Obtener los ROLES del usuario para verificar si es ADMIN
      const rolesUrl = `${base}/admin/realms/${realm}/users/${id}/role-mappings/realm`;
      const rolesRes = await fetch(rolesUrl, { headers: { Authorization: `Bearer ${keycloak.token}` } });
      const rolesData = await rolesRes.json();
      const rolesNames = rolesData.map(r => r.name);
      const isTargetAdmin = rolesNames.includes('ADMIN');

      setUser(data);
      setForm({
        firstName: data.firstName || '',
        firstLastName: data.attributes?.apellidoPaterno?.[0] || '',
        secondLastName: data.attributes?.apellidoMaterno?.[0] || '',
        email: data.email || '',
        rut: (data.attributes?.rut?.[0]) || '',
        nacionalidad: (data.attributes?.nacionalidad?.[0]) || '',
        enabled: data.enabled,
        isAdmin: isTargetAdmin // Guardamos si el usuario editado es admin
      });
    } catch (e) {
      setError(e.message || 'Error fetching user');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, [initialized, keycloak, id]);

  const handleChange = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await keycloak.updateToken(10).catch(() => {});
      const { base, realm } = deriveAdminBase();
      const url = `${base}/admin/realms/${realm}/users/${id}`;

      const payload = {
        id: user.id,
        username: user.username,
        enabled: !!form.enabled,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        attributes: { ...(user.attributes || {}) }
      };
      if (form.rut) payload.attributes.rut = [form.rut]; else delete payload.attributes.rut;
      if (form.nacionalidad) payload.attributes.nacionalidad = [form.nacionalidad]; else delete payload.attributes.nacionalidad;

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keycloak.token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      navigate('/admin/users');
    } catch (e) { setError(e.message || 'Error updating user'); } finally { setLoading(false); }
  };

  if (!initialized) return null;
  if (!keycloak || !keycloak.authenticated) return <div>Autenticación requerida</div>;

  return (
    <div className="container">
      <div className="glass-card" style={{ padding: '1rem', maxWidth: 800 }}>
        <h2 style={{ fontSize: '35px' }}>Editar Usuario</h2>
        {loading && <div>Cargando...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && user && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
            <label><br />Nombre(s)</label>
            <input className="form-input" value={form.firstName} onChange={e => handleChange('firstName', e.target.value)} />
            <label>Apellido Paterno</label>
            <input className="form-input" value={form.firstLastName} onChange={e => handleChange('firstLastName', e.target.value)} />
            <label>Apellido Materno</label>
            <input className="form-input" value={form.secondLastName} onChange={e => handleChange('secondLastName', e.target.value)} />
            <label>Email</label>
            <input className="form-input" value={form.email} onChange={e => handleChange('email', e.target.value)} />
            <label style={{ color: form.isAdmin ? '#888' : 'inherit' }}>
              RUT {form.isAdmin ? '(Protegido por ser ADMIN)' : ''}
            </label>
            <input 
              className="form-input" 
              value={form.rut} 
              onChange={e => handleChange('rut', e.target.value)}
              disabled={form.isAdmin} // BLOQUEO AQUÍ
              style={form.isAdmin ? { backgroundColor: '#7f7e7e', cursor: 'not-allowed', color: '#3b3b3b' } : {}}
            />
            <label>Nacionalidad</label>
            <input className="form-input" value={form.nacionalidad} onChange={e => handleChange('nacionalidad', e.target.value)} />
            <label>
              <input type="checkbox" checked={form.enabled} onChange={e => handleChange('enabled', e.target.checked)} /> Habilitado
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="button button-primary" type="submit">Guardar</button>
              <button className="button button-outline" type="button" onClick={() => navigate('/admin/users')}>Cancelar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminUserEdit;
