import React from 'react';
// import { useEffect } from 'react';
import "./App.css"
import AppRoutes from './Routes/Routes';

const App: React.FC = () => {
  return (
    <div className='main'>
      <AppRoutes />
    </div>
  )
};

export default App;
