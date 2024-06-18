import React, { useState, useEffect } from 'react';
import './LoginActivity.css'; 
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const LoginActivity: React.FC = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);

          if (decodedToken && decodedToken.exp > Math.floor(Date.now() / 1000)) {
            
            window.location.href = '/dashboards';
          } else {
            
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          localStorage.removeItem('token'); 
        }
      }
    };

    checkToken();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3100/api/user/auth', {
        login,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        window.location.href = '/dashboards'; 
      } else {
      
        console.error('Login failed');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  return (
    <div className="login-activity-container">
      <div className="login-activity">
        <h2>Login Activity</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Enter login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>

          <button
            type="submit"
            className="btn login-button"
            style={{ fontSize: '1.2rem', padding: '10px 20px', color: '#ffffff' }}
          >
            Login
          </button>
        </form>

        <div className="additional-links">
          <Link to="/login/passwordForgot" className="forgot-password-link">
            Forgot Password?
          </Link>{' '}
          |{' '}
          <Link to="/register" className="register-link">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginActivity;