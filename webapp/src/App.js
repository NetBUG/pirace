// src/App.js
import React, { Component } from 'react';
import Countdown from './Countdown';
import Stopwatch from './Stopwatch';
import './App.css';

class App extends Component {
  state = {
    ackL: false,
    ackR: false,
    countdown: false,
    race: false,
  };
  render() {
    return (
      <div className="App">
        <h1>Countdown</h1>
        <Countdown state={this.state}
          startRace={() => this.setState({ race: true }) } stopRace={() => this.setState({ race: false }) }
          startCD={() => this.setState({ countdown: true }) } stopCD={() => this.setState({ countdown: false }) }/>
        {/*this.state.race ? 'Go!' : 'Push both buttons to begin...'*/}
        <h1>Stopwatch</h1>
        <table>
          <tbody>
          <tr>
            <td>
              {this.state.ackL ? 'START' : 'Push to begin...'}
              <Stopwatch state={this.state} pushtarget={() => this.setState({ ackL: true }) } resetTarget={() => this.setState({ ackL: false }) }/>
            </td>
            <td>
              {this.state.ackR ? 'START' : 'Push to begin...'}
              <Stopwatch state={this.state} pushtarget={() => this.setState({ ackR: true }) } resetTarget={() => this.setState({ ackR: false }) }/>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
  );
  }
}


export default App;