/******
/* React Component: Comparison of multiple parks
******/

import React, { Component } from 'react';

import SizeAndVisitor from './SizeAndVisitor.react';
import Visitors from './Visitors.react';
import Temperature from './Temperature.react';
import Events from './Events.react';
import WeatherEvents from './WeatherEvents.react';

class Comparison extends Component {
  _wrapper = {
    sizeAndVisitor: null,
    visitors: null,
    temperature: null,
    events: null,
    weatherEvents: null,
  };

  _getWidth = (type) => {
    return this._wrapper[type] === null ? 800 : this._wrapper[type].offsetWidth;
  }

  render() {
    const names = this.props.parks.map((park, i) => {
      return(<span key={i} className="label">
        <span className={`label-bg label-${i}`}/>{park.name}
      </span>);
    });
    const events = this.props.parks.map((park, i) => {
      return(<WeatherEvents key={park.id} park={park} order={i} getWidth={this._getWidth}/>);
    });
    return (
      <div className="row comparison">
        <div className="col-xs-12 names">
          {names}
        </div>
        <div className="col-xs-12 col-md-6 col-lg-4 col-md-offset-3 col-md-offset-4">
          <div ref={div => {this._wrapper.sizeAndVisitor = div;}} />
          <SizeAndVisitor {...this.props} getWidth={this._getWidth}/>
        </div>
        <div className="col-xs-12 col-md-10 col-lg-8 col-md-offset-1 col-md-offset-2">
          <div ref={div => {this._wrapper.visitors = div;}} />
          <Visitors parks={this.props.parks} getWidth={this._getWidth}/>
        </div>
        <div className="col-xs-12 col-md-10 col-lg-8 col-md-offset-1 col-md-offset-2">
          <div ref={div => {this._wrapper.temperature = div;}} />
          <Temperature parks={this.props.parks} getWidth={this._getWidth}/>
        </div>
        <div className="col-xs-12 col-md-10 col-lg-8 col-md-offset-1 col-md-offset-2">
          <div ref={div => {this._wrapper.events = div;}} />
          <Events parks={this.props.parks} getWidth={this._getWidth}/>
        </div>
        <div className="col-xs-12 col-md-10 col-lg-8 col-md-offset-1 col-md-offset-2">
          <div ref={div => {this._wrapper.weatherEvents = div;}} />
          {events}
        </div>
      </div>
    )
  }
}

export default Comparison;
