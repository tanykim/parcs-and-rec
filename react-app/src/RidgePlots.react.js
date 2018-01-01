/******
/* React Component: for Ridge Plots of National Parks visitors data
******/

import * as d3 from 'd3';
import _ from 'lodash';
import chroma from 'chroma-js';
import React, { Component } from 'react';
import Select from 'react-select';

// distance between two plots
const plotDist = 20;
const margin = {top: 20, right: 0, bottom: 40, left: 300};
const dim = {w: null, h: null};

class RidgePlots extends Component {
  state = {sortOption: 'total-desc'};

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
    const svg = d3.select('#ridge-plots')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom + plotHeight);

    // add two points on each side of X axis
    const x = d3.scaleLinear().range([0, dim.w]).domain([0, 15]);
    const maxMonthly = _.max(data.parks.map(d => _.max(d.by_month)));
    // since the y base is 0, do not swap range
    const y = d3.scaleLinear().range([0, plotHeight]).domain([0, maxMonthly]);
    const line = d3.line().x((d, i) => x(i)).y(d => -y(d));
    // fill the ridge graph with the size of the park
    const color = chroma.scale(['LightGoldenrodYellow', 'Green', 'DarkGreen'])
      .domain([data.min_size, data.max_size]);

    // sort the national parks
    const sorted = this._sortParks(data.parks, this.state.sortOption);
    for (let i in sorted) {
      const park = sorted[i];
      // wrapper
      const g = svg
        .append('g')
        .datum(park.id)
        .attr('transform', `translate(${margin.left}, ${margin.top + plotHeight + (+i * plotDist)})`)
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
        .attr('max', y(_.max(park.by_month)))
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

  _sortParks = (parks, optionVal) => {
    const option = optionVal.split('-');
    let sorted = _.orderBy(parks, d => d[option[0]]);
    sorted = option[1] === 'desc' ? sorted.reverse() : sorted;
    return sorted;
  }

  _onOptionChange = (sortOption) => {
    const optionVal = sortOption.value;
    // replacing place holder text
    this.setState({sortOption: optionVal});

    // sort the parks
    const sorted = this._sortParks(this.props.data.parks, optionVal);
    const parentNode = d3.select('#ridge-plots').node();
    // set the offset between margin top and the plot base)
    let maxY;
    for (let i in sorted) {
      const val = +d3.select(`.js-ridge-outline-${sorted[i].id}`).attr('max');
      if (+i === 0) {
        maxY = val;
      // check if the following parks height go over the maxY
    } else if (Math.max(val, +i * plotDist) > maxY) {
        maxY = Math.max(maxY, val - +i * plotDist);
      }
    }
    // animate the vertical position of each park
    for (let j in sorted) {
      const park = sorted[j];
      const sel = d3.select(`.js-ridge-g-${park.id}`);
      // rearrange; bring front to the vis
      parentNode.appendChild(sel.node());
      sel.transition()
        .attr('transform', `translate(${margin.left}, ${margin.top + maxY + (+j * plotDist)})`);
    }

  }

  componentDidMount() {
    dim.w = this.props.getWidth('ridgePlots') - margin.left - margin.right;
    dim.h = this.props.data.parks.length * plotDist;
    this._drawParks();
  }

  render() {
    return (
      <div className="row ridge-plots">
        <div className="col-xs-12 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">
          <Select
            clearable={false}
            searchable={false}
            value={this.state.sortOption}
            placeholder="Sort parks by"
            onChange={this._onOptionChange}
            options = {[
              {label: 'Name: A to Z', value: 'name-asc'},
              {label: 'Name: Z to A', value: 'name-desc'},
              {label: 'Total visitors: large to small', value: 'total-desc'},
              {label: 'Total visitors: small to large', value: 'total-asc'},
              {label: 'Size: large to small', value: 'size-desc'},
              {label: 'Size: small to large', value: 'size-asc'},
              {label: 'Location: west to east', value: 'lon-asc'},
              {label: 'Location: east to west', value: 'lon-desc'},
              {label: 'Location: north to south', value: 'lat-desc'},
              {label: 'Location: south to north', value: 'lat-asc'},
            ]}
          />
        </div>
        <div className="col-xs-12">
          <svg id="ridge-plots" className="ridge-plots-wrapper"/>
        </div>
      </div>
    );
  }
}


export default RidgePlots;
