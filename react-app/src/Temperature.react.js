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

class Temperature extends Component {

  _drawParks(parks) {
    const g = d3.select('.js-comp-temperature');
    g.selectAll('.js-comp-temperature-elm').remove();

    // put updated y axis
    g.append('g')
      .attr('class', 'axis y js-comp-temperature-elm')
      .call(d3.axisLeft(y));

    const line = d3.line().x((d, i) => x(i) + x.bandwidth() / 2).y(d => y(d));
    for (let order in parks) {
      const temperature = parks[order].temperature.map(temps => temps[1]);
      g.append('path')
        .datum(temperature)
        .attr('d', line)
        .attr('class', `temp-line line-${order} js-comp-temperature-elm`);
      g.selectAll(`.js-comp-temp-${order}`)
        .data(temperature)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => x(i) + x.bandwidth() / 2)
        .attr('cy', d => y(d))
        .attr('r', 4)
        .attr('class', `temp-circle fill-${order} js-comp-temp-${order} js-comp-temperature-elm`);
    }
  }

  _drawLines() {
    const svg = d3.select('#comp-temperature')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('class', 'js-comp-temperature');
    g.append('g')
      .attr('class', 'axis x')
      .call(d3.axisBottom(x).tickFormat(i => moment(i + 1, 'M').format('MMM')))
      .attr('transform', `translate(0, ${dim.h})`);
    g.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .text('mean temperature');
    this._drawParks(this.props.parks);
  }

  _getMaxTemp = (parks) => {
    const meanTemps = parks.map(park => park.temperature.map(temps => temps[1]));
    return _.max(meanTemps.map(park => _.max(park)));
  }

  componentWillReceiveProps(nextProps) {
    // park selection is updated
    if (this.props.parks.length !== nextProps.parks.length) {
      const maxTemparature = this._getMaxTemp(nextProps.parks);
      y.domain([0, maxTemparature]);
      this._drawParks(nextProps.parks);
    }
  }

  componentDidMount() {
    const width = this.props.getWidth('temperature');
    dim.w = width - margin.left - margin.right;
    dim.h = 300;
    x.rangeRound([0, dim.w]);
    const maxTemparature = this._getMaxTemp(this.props.parks);
    y.range([dim.h, 0]).domain([0, maxTemparature]);
    this._drawLines();
  }

  render() {
    return (
      <svg id="comp-temperature" />
    );
  }
}

export default Temperature;
