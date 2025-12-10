import logo from './logo.svg';
// src/App.js
import './App.css';                // keep your stylesheet import (or change if your css file is named differently)
import LoginCard from './components/LoginCard';
 // <-- must match filename (LoginCard.jsx / LoginCard.js)

function App() {
  return (
    <div className="App">
      <LoginCard />  {/* component name matches import */}
    </div>
  );
}

export default App;
