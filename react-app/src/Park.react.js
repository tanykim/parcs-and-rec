/******
/* React Component: selected national park
******/

import * as d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';

let barW = null;
let dist = null;
let chartH = null;
const chartX = d3.scaleBand().padding(0.1).domain(_.range(0, 12));

class Park extends Component {

  _addVisitors = (data) => {
    const g = d3.select('.js-park-visitors')
      .attr('transform', `translate(${barW * 1.4}, ${dist.bar})`);
    const y = d3.scaleLinear().range([chartH, 0]).domain([0, _.max(data)]);
    g.append('g')
      .attr('class', 'axis y js-park-elm')
      .call(d3.axisLeft(y));
    g.selectAll(`.js-park-visitors-bars`)
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => chartX(i))
      .attr('y', d => y(d))
      .attr('width', chartX.bandwidth())
      .attr('height', d => chartH - y(d))
      .attr('class', `js-park-elm js-park-visitors-bars`);
  }

  _addTemperature = (data) => {
    const g = d3.select('.js-park-temperature')
      .attr('transform', `translate(${barW * 1.4}, ${chartH + dist.bar + dist.temp})`);
    const y = d3.scaleLinear().range([chartH, 0])
      .domain([_.min(data.map(d => d[2])), _.max(data.map(d => d[0]))]);
    g.append('g')
      .attr('class', 'axis y js-park-elm')
      .call(d3.axisLeft(y));
    const maxMinAll = data.map(d => d[0]).concat(data.map(d => d[2]).reverse());
    const area = d3.line()
      .x((d, i) => (i < 12 ? chartX(i) : chartX(23 - i)) + chartX.bandwidth() / 2)
      .y(d => y(d))
    // show max-min as an area
    g.append('path')
      .datum(maxMinAll)
      .attr('d', area)
      .style('fill', 'lightGrey')
      .style('stroke', 'none')
      .attr('class', 'js-park-elm');
    const line = d3.line().x((d, i) => chartX(i) + chartX.bandwidth() / 2).y(d => y(d))
    // show max, mean, min
    for (let i in _.range(3)) {
      g.append('path')
        .datum(data.map(d => d[i]))
        .attr('d', line)
        .style('fill', 'none')
        .style('stroke', 'black')
        .attr('class', 'js-park-elm');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedParkId !== nextProps.selectedParkId && nextProps.selectedParkId != null) {
      d3.selectAll('.js-park-elm').remove();
      this._addVisitors(nextProps.data.visitors);
      this._addTemperature(nextProps.data.temperature);
    }
  }

  componentDidMount() {
    this._addVisitors(this.props.data.visitors);
    this._addTemperature(this.props.data.temperature);
  }

  render() {
    const {selectedOrder, margin, maxY, plotDist, x, y, data} = this.props;
    // draw lines & lable
    const months = data.visitors.map((month, i) => {
        const xPos = x(i + 2);
        const yPos = -y(month);
        return (<g key={i}>
          <text className="month-label" x={xPos} y={plotDist * 2}>{moment(i + 1, 'M').format('MMM')}</text>
          <line className="month-line" x1={xPos} x2={xPos} y1={yPos} y2={plotDist}/>
        </g>);
      });

    // set variables for chart
    barW = x(1) - x(0);
    chartX.rangeRound([0, barW * 12]);
    chartH = this.props.chartH;
    dist = this.props.dist;

    return (
      <g
        className="js-ridge-detail"
        transform={`translate(${margin.left}, ${margin.top + maxY + plotDist * selectedOrder})`}>
        <g className="ridge-month js-ridge-month">
          {months}
          <g className="js-park-visitors"/>
          <g className="js-park-temperature"/>
        </g>
      </g>
    );
  }
}

export default Park;
