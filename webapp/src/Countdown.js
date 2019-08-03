import React, { Component } from 'react';

class Countdown extends Component {
  state = {
    race: false,
    started: false,
    runningTime: 0,
    renderState: {
        b1: 'cd_hidden',
        b2: 'cd_hidden',
        b3: 'cd_hidden',
      },
    };
  handleRender = (state) => {
    state.runningTime = Date.now() - this.startTime;
    if (state.runningTime < 1000) {
      this.props.startCD();
      state.renderState.b3 = 'cd_three';
    } else if (state.runningTime < 2000) {
      state.renderState.b3 = 'cd_inact';
      state.renderState.b2 = 'cd_two';
    } else if (state.runningTime < 3000) {
      state.renderState.b2 = 'cd_inact';
      state.renderState.b1 = 'cd_one';
    } else {
      state.race = true;
      state.renderState.b1 = 'cd_inact';
      this.props.startRace();
      this.props.stopCD();
    }
    this.setState(state);
  }
  componentDidUpdate() {
    if (this.props.state.ackL && this.props.state.ackR && !this.state.started) {
      this.handleClick();
    }
  }
  handleClick = () => {
    console.log('ura')
    this.setState(state => {
      if (state.started) {
        clearInterval(this.timer);
      } else {
        this.startTime = Date.now();
        this.handleRender(state);
        this.timer = setInterval(() => {
          this.handleRender(state);
        }, 1000);
        state.started = true;
      }
    });
  };
  handleReset = () => {
    clearInterval(this.timer); // new
    this.props.stopRace();
    this.props.stopCD();
    this.props.state.ackR = false;
    this.props.state.ackL = false;
    this.setState({ runningTime: 0, started: false, race: false, renderState: {
      b1: 'cd_hidden',
      b2: 'cd_hidden',
      b3: 'cd_hidden',
    } } );
  };
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  render() {
    const { race, renderState } = this.state;
    const { b1, b2, b3 } = renderState;
    return (
      <div>
        <p className="cd">
          &nbsp;
           <span className={b3}>3... </span>
           <span className={b2}>2... </span>
           <span className={b1}>1... </span> 
           <span className="cd_start">{race ? 'START' : ''}</span>
        </p>
        {/*<button onClick={this.handleClick}>{started ? 'Stop' : 'Start'}</button>*/}
        <button onClick={this.handleReset}>Reset</button>
      </div>
    );
  }
}

export default Countdown;
