import logo from './logo.svg';
import './App.css';

import Signup from './Signup';  // ← Import component

function App() {
  return (
    <div className="App">
      <Signup />   {/* Use the component */}
    </div>
  );
}

export default App;
