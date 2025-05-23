import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "./components/common/Navbar";
import AddPlayer from "./components/players/AddPlayer";
import GamePlayDetail from "./components/gamePlays/GamePlayDetail";
import Dashboard from "./pages/Dashboard";
import GameLibrary from "./pages/GameLibrary";
import GameDetail from "./components/games/GameDetail";
import PlayerDirectory from "./pages/PlayerDirectory";
import PlayerDetail from "./components/players/PlayerDetail";
import GamePlayLog from "./pages/GamePlayLog";
import AddGamePlay from "./components/gamePlays/AddGamePlay";
import EditGamePlay from "./components/gamePlays/EditGamePlay";
import "./index.css";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      refetchOnWindowFocus: false, // Prevent refetching on window focus
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
              <Route path="/players/add" element={<AddPlayer />} />

              <Route path="/game-plays" element={<GamePlayLog />} />
              <Route path="/game-plays/add" element={<AddGamePlay />} />
              <Route path="/game-plays/:id" element={<GamePlayDetail />} />
              <Route path="/game-plays/:id/edit" element={<EditGamePlay />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
