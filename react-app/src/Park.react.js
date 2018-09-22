/******
/* React Component: selected national park
******/

import React, { Component } from 'react';
import ParkVisitors from './ParkVisitors.react';
import ParkTemperature from './ParkTemperature.react';
import { withStore } from './store';

let Park = withStore('openedParks')(class extends Component {

  _wrapper = {
    visitors: null,
    temperature: null,
  };

  _getWidth = (type) => {
    return this._wrapper[type]=== null ? 800 : this._wrapper[type].offsetWidth;
  }

  render() {
    console.log(this.props.park);
    const isOpen = this.props.store.get('openedParks').indexOf(this.props.park.id) > -1;
    const {id, name, state, size, visitors, total, temperature} = this.props.park;
    if (isOpen) {
      return (<div className="row">
        <div className="col-xs-12">
          <div ref={div => {this._wrapper.visitors = div;}} />
          <div ref={div => {this._wrapper.temperature = div;}} />
          <h1>{name}</h1>
          <h2>{state}</h2>
          <h3>{`${size.toLocaleString()} acres`}</h3>
          <h3>{`${total.toLocaleString()} visitors in 2017`}</h3>
          <ParkVisitors
            data={visitors}
            getWidth={this._getWidth}
            id={id}/>
          <ParkTemperature
            data={temperature.map(d => d.mean)}
            getWidth={this._getWidth}
            id={id}/>
        </div>
      </div>);
    } else {
      return (<div>{name} ---closed</div>)
    }
  }
});

export default Park;
