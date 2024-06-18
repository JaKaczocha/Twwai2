import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/header';

import LoginActivity from './components/loginActivity';
import Header from './components/header';
import HomeActivity from './components/homeActivity';
import PasswordForgotComponent from './components/passwordForgotComponent';
import RegisterActivity from './components/registerComponent';
import DashboardActivity from './components/dashboardActivity';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  return (
    <Router>
      <div style={{   minHeight: '100vh', }}>
        <Header />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomeActivity/>} />
            <Route path="/login" element={<LoginActivity />} />
            <Route path="/register" element={<RegisterActivity/>} />
            <Route path="/login/passwordForgot" element={<PasswordForgotComponent/>} />
            <Route path='/dashboards' element={<DashboardActivity/>}/>
            <Route path='/adminPanel' element={<AdminPanel/>}/>
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;