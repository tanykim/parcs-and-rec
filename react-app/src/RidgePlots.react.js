/******
/* React Component: for Ridge Plots of National Parks visitors data
******/

import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';
import React, { Component } from 'react';

class RidgePlots extends Component {
  // state = {hovered: ''};

  _highlightPark(id, w) {
    d3.selectAll('.js-ridge-g')
      .filter(d => d !== id)
      .classed('dimmed', true)
      .selectAll('.js-ridge-outlines').attr('d', `M0,0h${w}`);
    d3.select(`.js-ridge-fill-${id}`).classed('hover', true);
    d3.select(`.js-ridge-outline-${id}`).classed('hover', true);
  }

  _revertParks(id, line) {
    d3.selectAll('.js-ridge-g')
      .classed('dimmed', false)
      .selectAll('.js-ridge-outlines').attr('d', line);
    d3.select(`.js-ridge-fill-${id}`).classed('hover', false);
    d3.select(`.js-ridge-outline-${id}`).classed('hover', false);
  }

  _drawParks() {
    const data = this.props.data;

    const plotHeight = 240;
    const plotDist = 20; // distance between two plots
    // y plot base is value 0, thus add plotHeight to top margin
    const margin = {top: 20 + plotHeight, right: 0, bottom: 40, left: 300};
    const dim = {
      w: this.props.getWidth('ridgePlots') - margin.left - margin.right,
      h: data.parks.length * plotDist,
    };
    const svg = d3.select('#ridge-plots')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom);

    // add two points on each side of X axis
    const x = d3.scaleLinear().range([0, dim.w]).domain([0, 15]);
    const maxMonthly = _.max(data.parks.map(d => _.max(d.by_month)));
    // since the y base is 0, do not swap range
    const y = d3.scaleLinear().range([0, plotHeight]).domain([0, maxMonthly]);
    const line = d3.line().x((d, i) => x(i)).y(d => -y(d));
    // fill the ridge graph with the size of the park
    const color = chroma.scale(['LightGoldenrodYellow', 'Green', 'DarkGreen'])
      .domain([data.min_size, data.max_size]);

    // TODO: let the sorting available
    const ordered = _.orderBy(data.parks, d => d.total).reverse();

    for (let i in ordered) {
      const park = ordered[i];
      // wrapper
      const g = svg
        .append('g')
        .datum(park.id)
        .attr('transform', `translate(${margin.left}, ${margin.top + (+i * plotDist)})`)
        .attr('class', `ridge-g js-ridge-g js-ridge-g-${park.id}`);
      const c = color(park.size);
      let lineData = _.concat([0, 0], park.by_month, [0, 0]);
      // filling gap between two plots
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', dim.w)
        .attr('height', plotDist)
        .style('fill', c)
        .attr('class', `ridge-plot-fill js-ridge-fill-${park.id}`)
      g.append('path')
        .datum(lineData)
        .attr('d', line)
        .attr('fill', c)
        .attr('class', `ridge-plot-outline js-ridge-outlines js-ridge-outline-${park.id}`)
        .on('mouseover', () => {
          this._highlightPark(park.id, dim.w);
        })
        .on('mouseout', () => {
          this._revertParks(park.id, line);
        })
        .on('click', () => {
          console.log('-----------', park.name);
        });
      // national park name
      g.append('text')
        .text(park.name.replace('National Park', 'NP').replace(' & Preserve', '&P'))
        .attr('x', 0)
        .attr('y', plotDist / 2)
        .attr('class', 'ridge-plot-name')
        .on('mouseover', () => {
          this._highlightPark(park.id, dim.w);
        })
        .on('mouseout', () => {
          this._revertParks(park.id, line);
        });
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   if (this.props.selectedPark !== nextProps.selectedPark) {
  //     console.log(nextProps.selectedPark);
  //   }
  // }

  componentDidMount() {
    this._drawParks();
  }

  render() {
    return (
      <svg id="ridge-plots" className="ridge-plots-wrapper"/>
    );
  }
}


export default RidgePlots;
