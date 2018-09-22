/******
/* React Component: Visitors of the selected national park
******/

import _ from 'lodash';
import * as d3 from 'd3';
import moment from 'moment';
import React, { Component } from 'react';

class ParkVisitors extends Component {

  componentDidMount() {
    const margin = {top: 20, right: 20, bottom: 20, left: 100};
    const dim = {
      w: this.props.getWidth('visitors') - margin.left - margin.right,
      h: 300 - margin.top - margin.bottom
    };
    const {id, data} = this.props;
    const svg = d3.select(`#park-${id}-visitors`)
      .append('svg')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    const x = d3.scaleBand().padding(0.1).range([0, dim.w]).domain(_.range(0, 12));
    const y = d3.scaleLinear().range([dim.h, 0]).domain([0, _.max(data)]);
    g.append('g')
      .attr('class', 'axis y')
      .call(d3.axisLeft(y));
    g.append('g')
      .attr('class', 'axis x')
      .call(d3.axisBottom(x).tickFormat(i => moment(i + 1, 'M').format('MMM')))
      .attr('transform', `translate(0, ${dim.h})`);
    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => x(i))
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => dim.h - y(d))
      .attr('class', `park-visitors-bar`);
  }

  render() {
    return (<div id={`park-${this.props.id}-visitors`}/>);
  }
};

export default ParkVisitors;
