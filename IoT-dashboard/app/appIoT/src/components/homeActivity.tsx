import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface HomeActivityProps {
  username: string; // Prop typu string, reprezentujący nazwę użytkownika
}

const HomeActivity= () => {
  const [userData, setUserData] = useState<{ name: string; userId: string; exp: number } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const { name, userId, exp } = decodedToken;
        setUserData({ name, userId, exp });
      } catch (error) {
        console.error('Error decoding token:', error);
        // Handle decoding error, e.g., invalid token format
      }
    }
  }, []);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(); // Format date as per locale
  };

  return (
    <div>
      <h1>Welcome!</h1>
      <p>This is your home activity page.</p>
      <p>Feel free to explore our services and content.</p>

      {userData && (
        <div>
          <p>Name: {userData.name}</p>
          <p>User ID: {userData.userId}</p>
          <p>Expiration Date: {formatDate(userData.exp)}</p>
        </div>
      )}
    </div>
  );
};

export default HomeActivity;
