import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Asesor from './pages/Asesor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/asesor" element={<Asesor />} />
      </Routes>
    </Router>
  );
}

export default App;
