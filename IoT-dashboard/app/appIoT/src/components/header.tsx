import React from 'react';
import './Header.css'; // Importowanie arkusza stylów dla nagłówka
import logo from './logo.png'; // Importowanie logo
import outIcon from './logout.png'; // Importowanie ikony wylogowania
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await fetch(`http://localhost:3100/api/user/logout/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        localStorage.setItem('token', ''); // Czyszczenie tokenu
        alert('Logged out successfully');
        window.location.reload(); // Odświeżenie strony po wylogowaniu
        // Dodaj dodatkowe działania, np. przekierowanie do strony logowania
      } else {
        alert('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An error occurred while logging out');
    }
  };

  const token = localStorage.getItem('token');
  let isAuthenticated = false;
  let isAdmin = false;
  let decodedToken: any = null;

  if (token) {
    try {
      decodedToken = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      isAuthenticated = decodedToken.exp > currentTime;
      isAdmin = decodedToken.role === 'admin';
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  return (
    <header className="header">
      <div className="logo">
        <img src={logo} alt="Logo" />
        <span>My Website</span>
      </div>
      <nav className="nav">
        <ul>
          <li><a href="/">Home</a></li>
          
          {isAuthenticated ? (
            <>
              <li><a href="/dashboards">Dashboards</a></li>
              {isAdmin && <li><a href="/adminPanel">Admin Panel</a></li>}
              <li><img src={outIcon} alt="Logout" className="logout-icon" onClick={handleLogout} /></li>
            </>
          ) : (
            <>
              <li><a href="/login">Dashboards</a></li>
              <li><a href="/login">Login</a></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;