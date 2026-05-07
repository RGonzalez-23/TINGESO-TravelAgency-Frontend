import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const AdminUsers = () => {
  const { keycloak, initialized } = useKeycloak();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deriveAdminBase = () => {
    const iss = keycloak?.tokenParsed?.iss;
    if (iss && iss.includes('/realms/')) {
      const base = iss.split('/realms')[0];
      const realm = iss.split('/realms/')[1];
      return { base, realm };
    }
    return { base: 'http://localhost:8080', realm: 'travel-realm' };
  };

  const fetchUsers = async () => {
  if (!initialized || !keycloak || !keycloak.authenticated) return;
  setLoading(true);
  setError(null);
  try {
    await keycloak.updateToken(10).catch(() => {});
    const { base, realm } = deriveAdminBase();
    
    const url = `${base}/admin/realms/${realm}/users?first=0&max=100`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${keycloak.token}` } });
    const data = await res.json();

    const usersWithRoles = await Promise.all(
      data.map(async (user) => {
        try {
          const rolesRes = await fetch(
            `${base}/admin/realms/${realm}/users/${user.id}/role-mappings/realm`,
            { headers: { Authorization: `Bearer ${keycloak.token}` } }
          );
          const rolesData = await rolesRes.json();
          return { ...user, realmRoles: rolesData.map(r => r.name) };
        } catch (err) {
          return { ...user, realmRoles: [] };
        }
      })
    );

    setUsers(usersWithRoles);
  } catch (e) {
    setError(e.message || 'Error fetching users');
  } finally {
    setLoading(false);
  }
};  

  useEffect(() => { fetchUsers(); }, [initialized, keycloak]);

  return (
    <div className="container">
      <div className="glass-card" style={{ padding: '1rem' }}>
        <h2>Usuarios del Realm</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <div style={{ marginTop: '1rem' }}>
          {loading ? (
            <div>Cargando usuarios...</div>
          ) : (
            <table className="admin-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Administrador</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isAdmin = u.realmRoles?.includes('ADMIN');
                  return(
                    <tr key={u.id}>
                      <td style={{ textAlign: 'center' }}>{(u.firstName || '') + ' ' + (u.attributes?.apellidoPaterno?.[0] || '') + ' ' + (u.attributes?.apellidoMaterno?.[0] || '')}</td>
                      <td style={{ textAlign: 'center' }}>{u.email}</td>
                      <td style={{ textAlign: 'center' }}>
                        {isAdmin ? 'Sí' : 'No'}
                      </td>
                      <td style={{ textAlign: 'center' }}>  
                       <Link to={`/admin/users/${u.id}`} className="button button-outline">Editar</Link>
                      </td>
                    </tr>
                )})}
                {users.length === 0 && <tr><td colSpan="4">No se encontraron usuarios.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
