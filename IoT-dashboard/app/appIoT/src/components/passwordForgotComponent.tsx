import React, { useState } from 'react';
import './PasswordForgotComponent.css';
import axios from 'axios';

const PasswordForgotComponent: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

 

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3100/api/user/reset-password', {
        email
      });

      if (response.status === 200) {
        localStorage.setItem('token', response.data.token);
        window.location.href = '/login'; 
      } else {
      
        console.error('Login failed');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };


  return (
    <div className="password-forgot-container">
      <div className="password-forgot">
        <h2>Forgot Password?</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>

          <button type="submit" className="btn send-button">
            Send new password
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default PasswordForgotComponent;