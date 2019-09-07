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
      if (message && message.event) {
        if (message.id === this.state.id) {
		  // console.log(message);
		  if (message.event === 'button') {
			if (this.props.state.race && typeof this.state.runningTime === 'number') {
			  this.props.ws.send(JSON.stringify({ event: 'enable', id: this.state.id }));
			}
			// this.handleClick(); // NOTICE: uncomment if needed!
		  } else if (message.event === 'endstop') {
			clearInterval(this.timer);
            this.props.ws.send(JSON.stringify({ event: 'disable', id: this.state.id }));			
		  } /* else {
			  alert(JSON.stringify(message));
		  } */
		}
    });  
  };
  storeState(str) {
    if (this.props.pos === 'left') this.props.state.timeL = str;
    if (this.props.pos === 'right') this.props.state.timeR = str;
    // console.log('Id: ', this.props.pos, ', state: ', str);
  };
  startCountdown = () => {
    const startTime = Date.now() - this.state.runningTime;
    this.timer = setInterval(() => {
      if (!this.props.state.race) {
        clearInterval(this.timer);
        this.props.ws.send(JSON.stringify({ event: 'disable', id: this.state.id }));
        this.setState({ status: false });
      } else {
        this.setState({ status: true });
      }
      this.setState({ runningTime: Date.now() - startTime });
      this.storeState(this.state.runningTime);
    });
  } // startCountdown
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
    };
    this.setState(state => {
      if (state.status) {
		if (!this.props.state.race) {
          clearInterval(this.timer);
	    } else {
		  console.log('Car ', this.state.id, ' within race!');
		}
	    return { status: false };
      } else {
		console.log('Trying to start car ', this.state.id);
        if (this.props.state.race && typeof this.state.runningTime === 'number') {
			console.log('Starting car ', this.state.id);
            this.props.ws.send(JSON.stringify({ event: 'enable', id: this.state.id }));
            const startTime = Date.now() - this.state.runningTime;
            this.timer = setInterval(() => {
              if (!this.props.state.race) {
                clearInterval(this.timer);
                this.props.ws.send(JSON.stringify({ event: 'disable', id: this.state.id }));
                this.setState({ status: false });
              }
              this.setState({ runningTime: Date.now() - startTime });
              this.storeState(this.state.runningTime);
            });
		  return { status: true };
            // this.props.ws.send(JSON.stringify({ event: 'enable', id: this.state.id }));
            // this.startCountdown();
        } else {
          this.props.ws.send(JSON.stringify({ event: 'disable', id: this.state.id }));
          if (this.props.state.countdown) {
            state.runningTime = 'False start!';
            this.storeState(state.runningTime);
          }
		  return { status: false };
        }
      }
    });
  };
  handleReset = () => {
    clearInterval(this.timer); // new
    this.setState({ runningTime: 0, status: false });
  };
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  componentDidUpdate() {
    console.log('Updated');
    if (this.props.state.race && !this.state.status) {
      console.log('Starting...');
      this.startCountdown();
    }
  }
  showSeconds(time) {
    return Math.floor(time / 1000) + "." + Math.round(time % 1000 / 10);
  }
  render() {
    const { runningTime } = this.state;
    return (
      <div>
        <p className="watch">{typeof runningTime === 'number' ? this.showSeconds(runningTime) : runningTime}
        {typeof runningTime === 'number' ? ' s' : ''}</p>
        <button onClick={this.handleClick}>Start</button>
        { /* <button onClick={this.handleReset}>Reset</button>*/ }
      </div>
    );
  }
}

export default Stopwatch;
