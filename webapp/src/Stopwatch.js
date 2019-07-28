import React, { Component } from 'react';

class Stopwatch extends Component {
  state = {
    status: false,
    runningTime: 0
  };
  handleClick = () => {
    if (!this.props.state.ackR || !this.props.state.ackL) {
        this.props.pushtarget();
        return;
    }
    this.setState(state => {
      if (state.status) {
        clearInterval(this.timer);
      } else {
        if (this.props.state.race) {
            const startTime = Date.now() - this.state.runningTime;
            this.timer = setInterval(() => {
            this.setState({ runningTime: Date.now() - startTime });
            });
        } else if (this.props.state.countdown) {
            state.runningTime = 'False start!';
        }
      }
      return { status: !state.status };
    });
  };
  handleReset = () => {
    clearInterval(this.timer); // new
    this.setState({ runningTime: 0, status: false });
  };
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  render() {
    const { status, runningTime } = this.state;
    return (
      <div>
        <p>{runningTime}ms</p>
        <button onClick={this.handleClick}>{status ? 'Stop' : 'Start'}</button>
        <button onClick={this.handleReset}>Reset</button>
      </div>
    );
  }
}

export default Stopwatch;
