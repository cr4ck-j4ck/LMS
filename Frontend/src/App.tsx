import React from 'react';
import { useEffect } from 'react';
import "./App.css"
import AppRoutes from './Routes/Routes';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const App: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  useEffect(() => {
    if (currentPath === "/") {
      navigate("/dashboard");
    }
  }, []);
  return (
    <div className='main'>
      <AppRoutes />
    </div>
  )
};

export default App;
