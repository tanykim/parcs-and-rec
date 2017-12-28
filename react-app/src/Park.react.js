/******
/* React Component: selected national park
******/

import * as d3 from 'd3';
import _ from 'lodash';
import React, { Component } from 'react';

class Park extends Component {

  x = d3.scaleBand().padding(0.1).domain(_.range(0, 12));
  y = d3.scaleLinear();

  componentWillReceiveProps(nextProps) {
    if (this.props.park !== nextProps.park && nextProps.park !== '') {
      d3.selectAll('.js-park-elm').remove();
      for (let dom of ['visitor', 'prec', 'snow']) {
        this._drawBars(nextProps[dom], dom);
      }
      this._drawTemp(nextProps.temp);
    }
  }

  _drawBars(data, dom) {
    const g = d3.select(`.js-park-${dom}`);
    this.y.domain([0, _.max(data)]);
    g.append('g')
      .attr('class', 'axis y js-park-elm')
      .call(d3.axisLeft(this.y));
    g.selectAll(`.js-park-${dom}-bars`)
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => this.x(i))
      .attr('y', d => this.y(d))
      .attr('width', this.x.bandwidth())
      .attr('height', d => 400 - this.y(d))
      .attr('class', `js-park-elm js-park-${dom}-bars`);
  }

  _drawTemp(data) {
    const g = d3.select('.js-park-temp');
    this.y.domain([Math.min(0, _.min(data.map(d => d[2]))), _.max(data.map(d => d[0]))]);
    g.append('g')
      .attr('class', 'axis y js-park-elm')
      .call(d3.axisLeft(this.y));
    const maxMinAll = data.map(d => d[0]).concat(data.map(d => d[2]).reverse());
    const area = d3.line()
      .x((d, i) => (i < 12 ? this.x(i) : this.x(23 - i)) + this.x.bandwidth() / 2)
      .y(d => this.y(d))
    g.append('path')
      .datum(maxMinAll)
      .attr('d', area)
      .style('fill', 'lightGrey')
      .style('stroke', 'none')
      .attr('class', 'js-park-elm');
    const line = d3.line().x((d, i) => this.x(i) + this.x.bandwidth() / 2).y(d => this.y(d))
    for (let i in _.range(3)) {
      g.append('path')
        .datum(data.map(d => d[i]))
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', 'black')
        .attr('class', 'js-park-elm');
    }
  }

  componentDidMount() {
    const dim = {w: 600, h: 400};
    const margin = {top: 10, right: 20, bottom: 20, left: 80};
    this.x.rangeRound([0, dim.w]);
    this.y.range([dim.h, 0]);
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let vis of ['visitor', 'temp', 'prec', 'snow']) {
      d3.select(`#park-${vis}`)
        .attr('width', dim.w + margin.left + margin.right)
        .attr('height', dim.h + margin.top + margin.bottom)
        .append('g')
        .attr('class', `js-park-${vis}`)
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
      d3.select(`.js-park-${vis}`).append('g')
        .attr('class', 'axis x')
        .attr('transform', `translate(0, ${dim.h})`)
        .call(d3.axisBottom(this.x).tickFormat(d => labels[d]));
    }

  }

  render() {
    return (
      <div>
        <svg id="park-visitor"></svg>
        <svg id="park-temp"></svg>
        <svg id="park-prec"></svg>
        <svg id="park-snow"></svg>
      </div>
    );
  }
}


export default Park;