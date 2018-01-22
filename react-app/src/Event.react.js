/******
/* React Component: weather event component, coxcomb type
******/

import * as d3 from 'd3';
import moment from 'moment';
import React, { Component } from 'react';

class Event extends Component {

  _drawChart = (props) => {
    const {vis, type, width, height, data, fill} = props;
    const g = d3.select(`.js-event-${vis}-${type}`);
    g.html('');
    const r = Math.min(width - 10, height) / 2;
    const radius = d3.scaleLinear().range([0, r]).domain([0, 31]);
    // const opacity = d3.scaleLinear().range([0, 1]).domain([0, 31]);
    // draw coxcomb from January
    const arc = (i, d) => {
      return d3.arc()
        .innerRadius(0)
        .outerRadius(radius(d))
        // .outerRadius(r)
        .startAngle(Math.PI * 2 / 12 * i)
        .endAngle(Math.PI * 2 / 12 * (i + 1));
      }
    for (let i in data) {
      g.append('circle')
        .attr('cx', width / 2)
        .attr('cy', r)
        .attr('r', r)
        .style('fill', 'none')
        .style('stroke', 'grey');
      g.append('path')
        .attr('d', arc(+i, data[i]))
        .attr('class', `fill-${fill}`)
        .attr('transform', `translate(${width / 2}, ${r})`);
      const angle = 360 / 12 * +i;
      const radian = Math.PI * 3 - Math.PI * 2 / 12 * (+i + 0.5);
      g.append('text')
        .attr('x', Math.sin(radian) * r)
        .attr('y', Math.cos(radian) * r)
        .text(moment(+i + 1, 'M').format('MMM'))
        .attr('class', 'coxcomb-label')
        .attr('transform', `translate(${width / 2}, ${r})`);
    }
  }

  componentDidMount() {
    this._drawChart(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this._drawChart(nextProps);
  }
  
  render() {
    return (<g
      className={`js-event-${this.props.vis}-${this.props.type}`}
      transform={`translate(${this.props.left}, 0)`}
      />);
  }
}

export default Event;
