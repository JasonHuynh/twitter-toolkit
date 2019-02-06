import React, { Component } from 'react';
import logo from './chrome-ext.png';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} alt="logo" width="340" height="98" />
        </header>
      </div>
    );
  }
}

export default App;
