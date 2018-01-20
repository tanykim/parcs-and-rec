/******
/* React Component: weather event component, coxcomb type
******/

import * as d3 from 'd3';
import React, { Component } from 'react';

class Event extends Component {

  componentDidMount() {
    const {type, width, height, data} = this.props;
    const g = d3.select(`.js-event-${type}`);
    // draw coxcomb from January
    const radius = d3.scaleLinear().range([0, height / 2]).domain([0, 31]);
    const arc = (i, d) => {
      return d3.arc()
        .innerRadius(0)
        .outerRadius(radius(d))
        .startAngle(Math.PI * 2 / 12 * i)
        .endAngle(Math.PI * 2 / 12 * (i + 1));
      }
    for (let i in data) {
      g.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', height / 2)
        .style('fill', 'none')
        .style('stroke', 'black');
      g.append('path')
        .attr('d', arc(+i, data[i]))
        .style('fill', 'black')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
    }
  }

  render() {
    return (<g
      className={`js-event-${this.props.type}`}
      transform={`translate(${this.props.left}, 0)`}
      />);
  }
}

export default Event;
