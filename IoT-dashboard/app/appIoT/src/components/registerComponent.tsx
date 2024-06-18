import React, { useState } from 'react';
import './registerActivity.css'; // Importing the stylesheet for RegisterActivity
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterActivity: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
        console.log("name: " + name);
        console.log("email: " + email);
        console.log(" password: " +  password);
       
      const response = await axios.post('http://localhost:3100/api/user/create', {
        name,
        email,
        password,
      });
      if (response.status === 200) {
        toast.success('Registration successful!', { autoClose: 1000 });
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-activity-container">
      <div className="register-activity">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <button type="submit" className="btn register-button">
            Register
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegisterActivity;