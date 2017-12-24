/******
/* React Component: for Ridge Plots of National Parks visitors data
******/

import * as d3 from 'd3';
import React, { Component } from 'react';

const data = require('./data/data.json');

class RidgePlots extends Component {

  componentDidMount() {
    const dim = {w: 1600, h: 600};
    const margin = {top: 20, right: 20, bottom:20, left: 50};
    const g = d3.select('#ridge-plots')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // set graph x and y range
    const x = d3.scaleLinear().range([0, dim.w]).domain(data.x_domain);
    const y = d3.scaleLinear().range([dim.h, 0]).domain(data.y_domain);

    // add temp axis
    g.append('g')
      .attr('transform', `translate(0, ${dim.h})`)
      .call(d3.axisBottom(x).ticks(10));
    g.append('g')
      .call(d3.axisLeft(y).ticks(10));

    // max total points
    const maxTotal = data.max_total_visitor;
    const valAxis = d3.scaleLinear().range([0, dim.h / 4]).domain([0, maxTotal]);

    // add line graph by each byLat
    for (const lat of data.by_latittude) {
      if (lat.parks_data.length > 2) {
        const line = d3.line()
          .x(d => x(d[0]))
          .y(d => y(lat.lat_rounded) - valAxis(d[1]))
          .curve(d3.curveMonotoneX);
        g.append('path')
          .datum(lat.parks_data)
          .attr('fill', 'white')
          .attr('stroke', 'green')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('d', line);
      }
    }

    // add mark on each park
    g.selectAll('circle')
      .data(data.parks)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.lon))
      .attr('cy', d => y(d.lat))
      .attr('r', 5)
      .style('opacity', 0.2)
      .on('mouseover', d => {
        console.log(d.name, d.state_abbr);
      });
  }

  render() {
    return (
      <div>
        Ridge Plots
        <svg id='ridge-plots'>
        </svg>
      </div>
    );
  }
}

export default RidgePlots;