/******
/* React Component: for Ridge Plots of National Parks visitors data
******/

import * as d3 from 'd3';
import _ from 'lodash';
import React, { Component } from 'react';

class RidgePlots extends Component {

  _drawParks(w, data) {
    const plotHeight = 60; // base height of each plot
    const plotDist = 14; // distance between two plots
    const yRatio = 4; // magnifying ratio of plotting value to plot height
    const dim = {h: plotDist * data.parks.length, w};
    // have margin on the top above the line
    const margin = {top: plotHeight * yRatio + 20, right: 20, bottom: 40, left: 60};
    const g = d3.select('#ridge-plots')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear().range([0, dim.w]).domain([0, 15]);
    const maxMonthly = _.max(data.parks.map(d => _.max(d.by_month)));
    const y = d3.scaleLinear().range([0, plotHeight]).domain([0, maxMonthly / yRatio]);
    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => -y(d));

    const color = d3.scaleThreshold()
        .domain(data.seasonal_domain)
        .range(['#fafad2','#d0e2aa','#a6c983','#7eb060','#56973e','#2d7e1c','#006400']);

    const ordered = _.orderBy(data.parks, d => d.total).reverse();
    for (let i in ordered) {
      const c = color(ordered[i].seasonal);
      g.append('path')
        .datum(_.concat([0, 0], ordered[i].by_month, [0, 0]))
        .attr('fill', c)
        // .attr('fill-opacity', 0.8)
        .attr('stroke', c)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1.5)
        .attr('d', line)
        .attr('transform', `translate(0, ${+i * plotDist})`);
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   if (this.props.selectedPark !== nextProps.selectedPark) {
  //     console.log(nextProps.selectedPark);
  //   }
  // }

  componentDidMount() {
    this._drawParks(this.props.getWidth('ridgePlots'), this.props.data);
  }

  render() {
    return (
      <svg id="ridge-plots" />
    );
  }
}


export default RidgePlots;
