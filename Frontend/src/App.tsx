import React from 'react';
import "./App.css"
import AppRoutes from './Routes/Routes';
import Navbar from './Layout/Navbar';

const App: React.FC = () => {
  return (
    <div className='main'>
      <Navbar />
      <AppRoutes/>
    </div>
  )
};

export default App;
