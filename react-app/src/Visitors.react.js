/******
/* React Component: selected national park
******/

import * as d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';

const margin = {top: 20, right: 20, bottom: 40, left: 100};
const dim = {w: null, h: null};
const x = d3.scaleBand().padding(0.1).domain(_.range(0, 12));
const y = d3.scaleLinear();

class Visitors extends Component {

  _drawParks(parks) {
    const g = d3.select('.js-comp-visitors');
    g.selectAll('.js-comp-visitors-elm').remove();

    // put updated y axis
    g.append('g')
      .attr('class', 'axis y js-comp-visitors-elm')
      .call(d3.axisLeft(y));

    const barW = dim.w / 12 * 0.8 / parks.length;

    for (let order in parks) {
      const park = parks[order];
      for (let month in park.visitors) {
        const yVal = y(park.visitors[month]);
        g.append('rect')
          .attr('x', x(month) + barW * +order)
          .attr('y', yVal)
          .attr('width', barW)
          .attr('height', dim.h - yVal)
          .attr('class', `fill-${order} js-comp-visitors-elm`);
      }
    }
  }

  _drawBarChart() {
    const svg = d3.select('#comp-visitors')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('class', 'js-comp-visitors');
    g.append('g')
      .attr('class', 'axis x')
      .call(d3.axisBottom(x).tickFormat(i => moment(i + 1, 'M').format('MMM')))
      .attr('transform', `translate(0, ${dim.h})`);
    g.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .text('visitors');
    this._drawParks(this.props.parks);
  }

  componentWillReceiveProps(nextProps) {
    // park selection is updated
    if (this.props.parks.length !== nextProps.parks.length) {
      const maxVisitors = _.max(nextProps.parks.map(park => _.max(park.visitors)));
      y.domain([0, maxVisitors]);
      this._drawParks(nextProps.parks);
    }
  }

  componentDidMount() {
    const width = this.props.getWidth('visitors');
    dim.w = width - margin.left - margin.right;
    dim.h = 300;
    x.rangeRound([0, dim.w]);
    const maxVisitors = _.max(this.props.parks.map(park => _.max(park.visitors)));
    y.range([dim.h, 0]).domain([0, maxVisitors]);
    this._drawBarChart();
  }

  render() {
    return (
      <svg id="comp-visitors" />
    );
  }
}

export default Visitors;
