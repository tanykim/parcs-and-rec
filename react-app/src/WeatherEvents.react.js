/******
/* React Component: selected national park
******/

import * as d3 from 'd3';
import _ from 'lodash';
import React, { Component } from 'react';
import Event from './Event.react';

class WeatherEvents extends Component {

  componentDidMount() {
    const width = this.props.getWidth('events');
    d3.select(`#comp-weather-events-${this.props.park.id}`)
      .attr('width', width).attr('height', 160);
  }

  render() {
    const types = ['rain', 'thunderstorm', 'fog', 'snow'];
    return (
      <svg id={`comp-weather-events-${this.props.park.id}`}>
        {types.map((type, i) => <Event
             vis={`comp-${this.props.park.id}`}
             key={i}
             data={this.props.park.events.map(event => event[type])}
             type={type}
             left={160 * i}
             width="160"
             height="160"
             fill={this.props.order}
           />)}
      </svg>
    );
  }
}

export default WeatherEvents;
