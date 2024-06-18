import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './AdminPanel.css'; 
import 'bootstrap/dist/css/bootstrap.min.css';

interface User {
    _id: string;
    email: string;
    name: string;
    active: boolean;
  }
  
  const AdminPanel = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
  
    useEffect(() => {
      const token = localStorage.getItem('token');
  
      if (token) {
        try {
          const decodedToken: { exp: number; role: string } = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000);
  
          if (decodedToken.exp > currentTime && decodedToken.role === 'admin') {
            setIsAdmin(true);
            fetchUsers(token);
          } else {
            console.error('Invalid or expired token, or user is not an admin.');
          }
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      } else {
        console.error('No token found.');
      }
    }, []);
  
    const fetchUsers = async (token: string) => {
      try {
        const response = await fetch('http://localhost:3100/api/user/all', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data); 
          setFilteredUsers(data);
        } else {
          console.error('Failed to fetch users:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
  
    const handleDelete = async (userId: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;
      
        try {
          const confirmed = window.confirm('Are you sure you want to delete this user?');
          if (!confirmed) return;
      
          const response = await fetch(`http://localhost:3100/api/user/${userId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
      
          if (response.ok) {
            setUsers(users.filter(user => user._id !== userId));
            setFilteredUsers(filteredUsers.filter(user => user._id !== userId));
            alert('User deleted successfully');
          } else {
            alert('Failed to delete user');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('An error occurred while deleting user');
        }
      };
  
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
      const term = event.target.value.toLowerCase();
      setSearchTerm(term);
      setFilteredUsers(users.filter(user => user.email.toLowerCase().includes(term) || user.name.toLowerCase().includes(term)));
    };
  
    if (!isAdmin) {
      return (
        <div className="admin-panel">
          <h2>Admin Panel - User Management</h2>
          <p>Access denied. You do not have permission to view this page.</p>
        </div>
      );
    }
  
    return (
      <div className="admin-panel">
        <h2>Admin Panel - User Management</h2>
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by email or name"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="user-cards">
          {filteredUsers.length === 0 ? (
            <p>No users available.</p>
          ) : (
            filteredUsers.map(user => (
              <div className="user-card" key={user._id}>
                <p><strong>ID:</strong> {user._id}</p>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Active:</strong> {user.active ? 'Yes' : 'No'}</p>
              <button className="btn btn-danger" onClick={() => handleDelete(user._id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;