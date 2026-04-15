import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
    phone: '',
    rut: '',
    nacionalidad: ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    // Validar contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Debe tener min. 12 caracteres, mayúscula, minúscula, número y un carácter especial';
    }

    // Validar formato chileno (+569XXXXXXXX o 9XXXXXXXX)
    if (formData.phone) {
      const phoneRegex = /^(\+?56)?9\d{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Ingresa un número chileno válido (ej. +56912345678 o 912345678)';
      }
    }

    // Validar correos
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          const data = await response.json();
          alert('¡Registro exitoso! Ya puedes iniciar sesión.');
          setFormData({
            nombres: '', apellidoPaterno: '', apellidoMaterno: '', email: '',
            password: '', phone: '', rut: '', nacionalidad: ''
          });
        } else {
          // Capturar el error arrojado por el backend (ej. "El correo ya existe")
          const errorMsg = await response.text();
          setErrors({ form: errorMsg || 'Error al registrar' });
        }
      } catch (err) {
        setErrors({ form: 'Error de conexión con el servidor' });
      }
    }
  };

  return (
    <div className="auth-page fade-in-up">
      <div className="auth-card auth-card-wide glass">
        <div className="auth-header">
          <h1>Únete a <span className="text-gradient">Nosotros</span></h1>
          <p>Crea tu cuenta para empezar a viajar</p>
        </div>
        
        {errors.form && <div className="error-message" style={{color: '#ff4d4d', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold'}}>{errors.form}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombres">Nombres</label>
            <input 
              type="text" 
              id="nombres" 
              name="nombres"
              className="form-input" 
              placeholder="Juan Carlos"
              value={formData.nombres}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="apellidoPaterno">Apellido Paterno</label>
              <input 
                type="text" 
                id="apellidoPaterno" 
                name="apellidoPaterno"
                className="form-input" 
                placeholder="Pérez"
                value={formData.apellidoPaterno}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="apellidoMaterno">Apellido Materno</label>
              <input 
                type="text" 
                id="apellidoMaterno" 
                name="apellidoMaterno"
                className="form-input" 
                placeholder="González"
                value={formData.apellidoMaterno}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rut">RUT</label>
              <input 
                type="text" 
                id="rut" 
                name="rut"
                className="form-input" 
                placeholder="12345678-9"
                value={formData.rut}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nacionalidad">Nacionalidad</label>
              <input 
                type="text" 
                id="nacionalidad" 
                name="nacionalidad"
                className="form-input" 
                placeholder="Chilena"
                value={formData.nacionalidad}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono (Celular)</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone"
              className="form-input" 
              placeholder="+56912345678"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico <span className="text-gradient">*</span></label>
            <input 
              type="email" 
              id="email" 
              name="email"
              className="form-input" 
              placeholder="tu@correo.com" 
              required 
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña <span className="text-gradient">*</span></label>
            <input 
              type="password" 
              id="password" 
              name="password"
              className="form-input" 
              placeholder="••••••••••••" 
              required 
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>
          
          <button type="submit" className="button button-primary auth-button">
            Registrarse
          </button>
        </form>
        
        <div className="auth-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login" className="auth-link">Inicia sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
