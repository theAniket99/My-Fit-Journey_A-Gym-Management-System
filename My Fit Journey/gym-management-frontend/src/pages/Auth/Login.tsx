import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '../../components/common/ParticlesBackground'; // ✅ Import Particles
import './Login.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      });

      const { token } = response.data;
      sessionStorage.setItem('jwtToken', token);

      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload.role?.replace('ROLE_', '');

      if (role === 'MEMBER') navigate('/member');
      else if (role === 'TRAINER') navigate('/trainer');
      else if (role === 'ADMIN') navigate('/admin');
      else navigate('/login');
    } catch (err: any) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <ParticlesBackground /> {/* ✅ Neon particles added */}
      <h1>MY FIT JOURNEY </h1>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
};

export default Login;
