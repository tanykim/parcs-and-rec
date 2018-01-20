/******
/* React Component: selected national park
******/

import * as d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';

import Event from './Event.react';

let barW = null;
const chartX = d3.scaleBand().padding(0.1).domain(_.range(0, 12));

class Park extends Component {

  _addVisitors = (data) => {
    const g = d3.select('.js-park-visitors');
    const height = this.props.chartH.bar;
    const y = d3.scaleLinear().range([height, 0]).domain([0, _.max(data)]);
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
      .attr('height', d => height - y(d))
      .attr('class', `js-park-elm js-park-visitors-bars`);
  }

  _addTemperature = (data) => {
    const g = d3.select('.js-park-temperature');
    const height = this.props.chartH.temp;
    const y = d3.scaleLinear().range([height, 0])
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

  _addEvents = (data) => {
    const g = d3.select('.js-park-events');
    for (let event in data) {

    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.data != null && nextProps.data != null && this.props.data.id !== nextProps.data.id) {
      d3.selectAll('.js-park-elm').remove();
      this._addVisitors(nextProps.data.visitors);
      this._addTemperature(nextProps.data.temperature);
    }
  }

  componentDidMount() {
    this._addVisitors(this.props.data.visitors);
    this._addTemperature(this.props.data.temperature);
    this._addEvents(this.props.data.events);
  }

  render() {
    const {selectedOrder, margin, maxY, dist, plotDist, x, y, data, chartH, chartW, detailH} = this.props;
    // draw lines & lable; add in render because it doesn't really need d3
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

    return (
      <div style={{position: 'absolute', top: `${margin.top + plotDist * selectedOrder}px`, left: `${margin.left}px`}}>
      <svg className="js-ridge-detail ridge-month" width={chartW} height={maxY + detailH}>
        <g transform={`translate(0, ${maxY})`}>{months}</g>
        <g className="js-park-visitors" transform={`translate(${barW * 1.4}, ${maxY + dist.bar})`}/>
        <g className="js-park-temperature" transform={`translate(${barW * 1.4}, ${maxY + dist.bar + chartH.bar + dist.temp})`}/>
        <g transform={`translate(0, ${maxY + dist.bar + chartH.bar + dist.temp + chartH.temp + dist.events})`}>
          {_.keys(this.props.data.events[0]).map((event, i) => {
            let width = chartW / 4;
            let left = width * i;
            return (<Event
              key={i}
              data={this.props.data.events.map(month => month[event])}
              type={event}
              left={left}
              width={width}
              height={chartH.events}/>)
          })}
        </g>
      </svg>
    </div>
    );
  }
}

export default Park;
