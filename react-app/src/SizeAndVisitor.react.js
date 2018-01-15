/******
/* React Component: selected national park
******/

import * as d3 from 'd3';
import React, { Component } from 'react';

const margin = {top: 20, right: 20, bottom: 40, left: 100};
const dim = {w: null, h: null};
const x = d3.scaleLinear();
const y = d3.scaleLinear();

class SizeAndVisitor extends Component {

  _drawParks(parks) {
    const g = d3.select('.js-comp-scatter');
    g.selectAll('circle').remove();
    g.selectAll('circle')
      .data(parks)
      .enter()
      .append('circle')
      .attr('cx', park => x(park.size))
      .attr('cy', park => y(park.total))
      .attr('r', 10)
      .attr('class', (park, i) => `circle-${i} js-comp-scatter-${park.id}`);
  }

  _drawScatterPlot() {
    const svg = d3.select('#comp-size-visitor')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('class', 'js-comp-scatter');
    g.append('g')
      .attr('class', 'axis x')
      .call(d3.axisBottom(x))
      .attr('transform', `translate(0, ${dim.h})`);
    g.append('g')
      .attr('class', 'axis y')
      .call(d3.axisLeft(y));
    g.append('text')
      .attr('x', dim.w)
      .attr('y', dim.h)
      .text('size');
    g.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .text('total visitors');
    this._drawParks(this.props.parks);
  }

  componentWillReceiveProps(nextProps) {
    // park selection is updated
    if (this.props.parks.length !== nextProps.parks.length) {
      this._drawParks(nextProps.parks);
    }
  }

  componentDidMount() {
    const width = this.props.getWidth('sizeAndVisitor');
    dim.w = width - margin.left - margin.right;
    dim.h = width - margin.top - margin.bottom;
    x.range([0, dim.w]).domain([0, this.props.maxSize]);
    y.range([dim.h, 0]).domain([0, this.props.maxTotalVisitor]);
    this._drawScatterPlot();
  }

  render() {
    return (
      <svg id="comp-size-visitor" />
    );
  }
}

export default SizeAndVisitor;
