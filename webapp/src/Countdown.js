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
      state.renderState.b3 = 'cd_three';
    } else if (state.runningTime < 2000) {
      this.props.startCD();
      state.renderState.b3 = 'cd_inact';
      state.renderState.b2 = 'cd_two';
    } else if (state.runningTime < 3000) {
      state.renderState.b2 = 'cd_inact';
      state.renderState.b1 = 'cd_one';
    } else if (state.runningTime < 8000) {
      state.race = true;
      state.renderState.b1 = 'cd_inact';
      this.props.startRace();
      this.props.stopCD();
    }
    if (state.runningTime < 8000) this.setState(state);
    else {
      this.handleReset();
    }
  }
  componentDidUpdate() {
    if (this.props.state.ackL && this.props.state.ackR && !this.state.started) {
      this.handleClick();
    }
  }
  handleClick = () => {
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
  submitStatus = () => {
    const statusObj = { event: 'log',
		left: this.props.state.timeL, 
		right: this.props.state.timeR, 
		date: new Date() };
    // console.log(statusObj);
    this.props.ws.send(JSON.stringify(statusObj));
    this.props.state.timeLog.push(statusObj)
  }
  handleReset = () => {
    // console.log('Storred!')
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
    this.submitStatus();
  };
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  render() {
    const { race, renderState } = this.state;
    const { b1, b2, b3 } = renderState;
    const { ackR, ackL } = this.props.state;
    return (
      <div>
        <p className="cd">
          &nbsp;
           <span className={b3}>3... </span>
           <span className={b2}>2... </span>
           <span className={b1}>1... </span> 
           <span className="cd_start">{race ? 'START' : ''}</span>
           <span className="cd_start">{race || ackR || ackL ? '' : 'TIMEOUT'}</span>
        </p>
        <span className="b1">{race || ackR || ackL ? '' : 'Игра начнётся, когда оба участника нажмут кнопку'}</span>
        {/*<button onClick={this.handleClick}>{started ? 'Stop' : 'Start'}</button>
        <button onClick={this.handleReset}>Reset</button> */}
      </div>
    );
  }
}

export default Countdown;
