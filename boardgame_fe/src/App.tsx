import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import AddPlayer from './components/players/AddPlayer';
import GamePlayDetail from './components/gamePlays/GamePlayDetail';
import Dashboard from './pages/Dashboard';
import GameLibrary from './pages/GameLibrary';
import GameDetail from './pages/GameDetail';
import PlayerDirectory from './pages/PlayerDirectory';
import PlayerDetail from './pages/PlayerDetail';
import GamePlayLog from './pages/GamePlayLog';
import AddGamePlay from './pages/AddGamePlay';
import './index.css';
import './App.css';

function App() {
  return (
    <Router>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
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
            <Route path="/players/add" element={<AddPlayer />} />
            <Route path="/game-plays/:id" element={<GamePlayDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;