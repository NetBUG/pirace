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
    handlers: [],
    timeR: '',
    timeL: '',
    timeLog: [],
  };
  ws = new WebSocket(URL);
  
  registerHandler(func) {
    console.log(this);
    this.state.handlers.push(func);
  }
  componentDidMount() {
    this.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected');
      this.ws.send(JSON.stringify({ state: 'ok' }))
    }
    this.ws.onmessage = evt => {
      // on receiving a message, add it to the list of messages
      const message = JSON.parse(evt.data);
      for (const handler of this.state.handlers) handler(message);
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
        <Countdown state={this.state}  ws={this.ws}
          startRace={() => this.setState({ race: true }) } stopRace={() => this.setState({ race: false }) }
          startCD={() => this.setState({ countdown: true }) } stopCD={() => this.setState({ countdown: false }) }/>
        {/*this.state.race ? 'Go!' : 'Push both buttons to begin...'*/}
        </div>
        <div className="sw_left">
          <Stopwatch ws={this.ws} wsProc={this.registerHandler} state={this.state} pushtarget={() => this.setState({ ackL: true }) } resetTarget={() => this.setState({ ackL: false }) } pos='left'/>
          <span className="b1">{this.state.ackL ? '' : 'Push to begin...'}</span>
        </div>
        <div className="sw_right">
          <Stopwatch ws={this.ws} wsProc={this.registerHandler} state={this.state} pushtarget={() => this.setState({ ackR: true }) } resetTarget={() => this.setState({ ackR: false }) } pos='right'/>
          <span className="b1">{this.state.ackR ? '' : 'Push to begin...'}</span>
        </div>
      </div>
  );
  }
}


export default App;
