import React, { Component } from 'react';

class Stopwatch extends Component {
  state = {
    status: false,
    runningTime: 0,
    id: '0',
  };
  componentDidMount() {
    if (this.props.pos === 'left') this.setState({ id: '1' });
    if (this.props.pos === 'right') this.setState({ id: '2' });
    this.props.wsProc(message => {
      if (message && message.event && message.event === 'button') {
        if (message.id === this.state.id) this.handleClick();
      }
    });  
  }

  handleClick = () => {
    if (!this.props.state.ackR || !this.props.state.ackL) {
        this.props.pushtarget();
        this.setState({ runningTime: 0 });
        setTimeout(() => {
            if ((this.props.pos === 'left' && !this.props.state.ackR) ||
              (this.props.pos === 'right' && !this.props.state.ackL)) {
              this.props.resetTarget();
            }
        }, 5000);
        return;
    }
    this.setState(state => {
      if (state.status) {
        clearInterval(this.timer);
      } else {
        if (this.props.state.race && typeof this.state.runningTime === 'number') {
            this.props.ws.send(JSON.stringify({ event: 'enable', id: this.state.id }));
            const startTime = Date.now() - this.state.runningTime;
            this.timer = setInterval(() => {
            this.setState({ runningTime: Date.now() - startTime });
            });
        } else if (this.props.state.countdown) {
          this.props.ws.send(JSON.stringify({ event: 'disable', id: this.state.id }));
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
    const { runningTime } = this.state;
    return (
      <div>
        <p className="watch">{runningTime}{typeof runningTime === 'number' ? 'ms' : ''}</p>
        <button onClick={this.handleClick}>Start</button>
        <button onClick={this.handleReset}>Reset</button>
      </div>
    );
  }
}

export default Stopwatch;
