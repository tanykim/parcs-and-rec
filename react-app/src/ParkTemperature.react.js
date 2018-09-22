/******
/* React Component: Visitors of the selected national park
******/

import _ from 'lodash';
import * as d3 from 'd3';
import moment from 'moment';
import React, { Component } from 'react';

class ParkTemperature extends Component {

  componentDidMount() {
    const margin = {top: 20, right: 20, bottom: 20, left: 100};
    const dim = {
      w: this.props.getWidth('temperature') - margin.left - margin.right,
      h: 300 - margin.top - margin.bottom
    };
    const {id, data} = this.props;
    const svg = d3.select(`#park-${id}-temperature`)
      .append('svg')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand().padding(0.1).range([0, dim.w]).domain(_.range(0, 12));
    const y = d3.scaleLinear().range([dim.h, 0])
      .domain([Math.min(_.min(data.map(d => d[2])), 0), _.max(data.map(d => d[0]))]);

    g.append('g')
      .attr('class', 'axis y')
      .call(d3.axisLeft(y));
    g.append('g')
      .attr('class', 'axis x')
      .call(d3.axisBottom(x).tickFormat(i => moment(i + 1, 'M').format('MMM')))
      .attr('transform', `translate(0, ${dim.h})`);

    const maxMinAll = data.map(d => d[0]).concat(data.map(d => d[2]).reverse());
    const area = d3.line()
      .x((d, i) => (i < 12 ? x(i) : x(23 - i)) + x.bandwidth() / 2)
      .y(d => y(d))
    // show max-min as an area
    g.append('path')
      .datum(maxMinAll)
      .attr('d', area)
      .style('fill', 'lightGrey')
      .style('stroke', 'none');
    const line = d3.line().x((d, i) => x(i) + x.bandwidth() / 2).y(d => y(d))
    // show max, mean, min
    for (let i in _.range(3)) {
      g.append('path')
        .datum(data.map(d => d[i]))
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', 'black');
    }

  }

  render() {
    return (<div id={`park-${this.props.id}-temperature`}/>);
  }
};

export default ParkTemperature;
