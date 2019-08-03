// src/App.js
import React, { Component } from 'react';
import Countdown from './Countdown';
import Stopwatch from './Stopwatch';
import './App.css';

const URL = 'ws://localhost:3030';


class App extends Component {
  state = {
    ackL: false,
    ackR: false,
    countdown: false,
    race: false,
  };
  ws = new WebSocket(URL);
  componentDidMount() {
    this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected');
      this.ws.send(JSON.stringify({ state: 'ok' }))
    }

    this.ws.onmessage = evt => {
      // on receiving a message, add it to the list of messages
      const message = JSON.parse(evt.data);
      console.log(message);
      if (message && message.event && message.event === 'button') {
        if (message.id === '1') this.setState({ackL: true});
        if (message.id === '2') this.setState({ackR: true});
      }
    }

    this.ws.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
      this.setState({
        ws: new WebSocket(URL),
      })
    }
  }
    
  render() {
    return (
      <div className="App">
        <div className="countdown">
        <Countdown state={this.state}
          startRace={() => this.setState({ race: true }) } stopRace={() => this.setState({ race: false }) }
          startCD={() => this.setState({ countdown: true }) } stopCD={() => this.setState({ countdown: false }) }/>
        {/*this.state.race ? 'Go!' : 'Push both buttons to begin...'*/}
        </div>
        <div className="sw_left">
          <Stopwatch state={this.state} pushtarget={() => this.setState({ ackL: true }) } resetTarget={() => this.setState({ ackL: false }) } pos='left'/>
          {this.state.ackL ? 'START' : 'Push to begin...'}
        </div>
        <div className="sw_right">
          <Stopwatch state={this.state} pushtarget={() => this.setState({ ackR: true }) } resetTarget={() => this.setState({ ackR: false }) } pos='right'/>
          {this.state.ackR ? 'START' : 'Push to begin...'}
        </div>
      </div>
  );
  }
}


export default App;