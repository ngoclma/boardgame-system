import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import GameLibrary from './pages/GameLibrary';
import GameDetail from './pages/GameDetail';
import PlayerDirectory from './pages/PlayerDirectory';
import PlayerDetail from './pages/PlayerDetail';
import GamePlayLog from './pages/GamePlayLog';
import AddGamePlay from './pages/AddGamePlay';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/games" element={<GameLibrary />} />
            <Route path="/games/:id" element={<GameDetail />} />
            <Route path="/players" element={<PlayerDirectory />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/game-plays" element={<GamePlayLog />} />
            <Route path="/game-plays/add" element={<AddGamePlay />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;