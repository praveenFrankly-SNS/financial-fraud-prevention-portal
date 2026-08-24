import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home           from './pages/Home';
import MakePayment    from './pages/MakePayment';
import Processing     from './pages/Processing';
import Transactions   from './pages/Transactions';
import SimulationMode from './pages/SimulationMode';
import HelpSupport    from './pages/HelpSupport';
import Settings       from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/pay"         element={<MakePayment />} />
        <Route path="/processing"  element={<Processing />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/simulation"  element={<SimulationMode />} />
        <Route path="/send"        element={<MakePayment />} />
        <Route path="/help"        element={<HelpSupport />} />
        <Route path="/settings"    element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
