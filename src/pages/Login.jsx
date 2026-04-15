import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login exitoso:", data);
        // Aquí normalmente guardaremos el token. Por ahora solo informamos éxito.
        alert("¡Login exitoso! Bienvenido " + data.user.fullName);
        navigate('/'); // Redirigir al inicio
      } else {
        const errorMsg = await response.text();
        setError(errorMsg || 'Credenciales incorrectas');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor. ¿Está el backend encendido?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in-up">
      <div className="auth-card glass">
        <div className="auth-header">
          <h1>Bienvenido <span className="text-gradient">de vuelta</span></h1>
          <p>Inicia sesión para continuar tu aventura</p>
        </div>
        
        {error && <div className="error-message" style={{color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold'}}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              placeholder="tu@correo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="button button-primary auth-button" disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>¿No tienes una cuenta? <Link to="/register" className="auth-link">Regístrate aquí</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
