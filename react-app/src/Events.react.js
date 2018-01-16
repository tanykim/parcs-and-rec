/******
/* React Component: selected national park
******/

import * as d3 from 'd3';
import _ from 'lodash';
import React, { Component } from 'react';
import Select from 'react-select';

const margin = {top: 20, right: 20, bottom: 40, left: 100};
const dim = {w: null, h: null};
const x = d3.scaleBand().padding(0.1).domain(_.range(0, 12));
const y = d3.scaleLinear().domain([0, 31]);

class Events extends Component {

  state = {event: 'rain'};

  _drawParks(parks, eventType) {
    const g = d3.select('.js-comp-events');
    g.selectAll('.js-comp-events-elm').remove();
    const barW = dim.w / 12 * 0.8 / parks.length;
    for (let order in parks) {
      const park = parks[order];
      for (let month in park.events) {
        const yVal = y(park.events[month][eventType]);
        g.append('rect')
          .attr('x', x(month) + barW * +order)
          .attr('y', yVal)
          .attr('width', barW)
          .attr('height', dim.h - yVal)
          .attr('class', `fill-${order} js-comp-events-elm`);
      }
    }
  }

  _drawBars() {
    const svg = d3.select('#comp-events')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom);
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('class', 'js-comp-events');
    g.append('g')
      .attr('class', 'axis x')
      .call(d3.axisBottom(x))
      .attr('transform', `translate(0, ${dim.h})`);
    g.append('g')
      .attr('class', 'axis y')
      .call(d3.axisLeft(y));
    g.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .text('Days');
    this._drawParks(this.props.parks, 'rain');
  }

  _onOptionChange = (sortOption) => {
    const optionVal = sortOption.value;
    this.setState({event: optionVal});
    // update the bars
    this._drawParks(this.props.parks, optionVal);
  }

  componentWillReceiveProps(nextProps) {
    // park selection is updated
    if (this.props.parks.length !== nextProps.parks.length) {
      this._drawParks(nextProps.parks);
    }
  }

  componentDidMount() {
    const width = this.props.getWidth('events');
    dim.w = width - margin.left - margin.right;
    dim.h = 300;
    x.rangeRound([0, dim.w]);
    y.range([dim.h, 0]);
    this._drawBars();
  }

  render() {
    return (
      <div>
        <Select
          clearable={false}
          searchable={false}
          value={this.state.event}
          placeholder="Sort parks by"
          onChange={this._onOptionChange}
          options = {[
            {label: 'Rain', value: 'rain'},
            {label: 'Fog', value: 'fog'},
            {label: 'Thunderstorm', value: 'thunderstorm'},
            {label: 'Snow', value: 'snow'},
          ]}
        />
        <svg id="comp-events" />
      </div>
    );
  }
}

export default Events;
