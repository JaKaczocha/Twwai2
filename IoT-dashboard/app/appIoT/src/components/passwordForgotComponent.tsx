import React, { useState } from 'react';
import './PasswordForgotComponent.css'; // Importowanie arkusza stylów dla PasswordForgotComponent

const PasswordForgotComponent: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Placeholder for handling form submission
    console.log('Password reset request submitted with:', email);
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
      </div>
    </div>
  );
};

export default PasswordForgotComponent;