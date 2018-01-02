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
let maxY;
const detailH = 300;
const line = d3.line();

class RidgePlots extends Component {
  state = {sortOption: 'total-desc', selectedPark: null};

  _resizeWrapperHeight() {
    d3.select('#ridge-plots')
      .attr('height', dim.h + margin.top + margin.bottom + maxY + (this.state.selectedPark && detailH));
  }

  _showDetail(order, id) {
    this.setState({selectedPark: id});
    // move down parks below the selected one
    d3.selectAll('.js-ridge-g')
      .attr('transform', function() {
        const o = +d3.select(this).attr('order');
        return `translate(${margin.left}, ${margin.top + maxY + (o > order ? detailH : 0) + (o * plotDist)})`
      });
    this._resizeWrapperHeight();
  }

  _highlightPark(id, isSwitch) {
    d3.selectAll('.js-ridge-g')
      .filter(d => d !== id)
      .classed('dimmed', true)
      .selectAll('.js-ridge-outlines').attr('d', `M0,0h${dim.w}`);
    d3.select(`.js-ridge-outline-${id}`).classed('hover', true);
  }

  _revertParks(id) {
    d3.selectAll('.js-ridge-g')
      .classed('dimmed', false)
      .selectAll('.js-ridge-outlines').attr('d', line);
    d3.select(`.js-ridge-outline-${id}`).classed('hover', false);
  }

  _drawParks() {
    const data = this.props.data;
    const plotHeight = 240;
    maxY = plotHeight;
    const svg = d3.select('#ridge-plots')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom + plotHeight);

    // add two points on each side of X axis
    const x = d3.scaleLinear().range([0, dim.w]).domain([0, 15]);
    const maxMonthly = _.max(data.parks.map(d => _.max(d.by_month)));
    // since the y base is 0, do not swap range
    const y = d3.scaleLinear().range([0, plotHeight]).domain([0, maxMonthly]);
    line.x((d, i) => x(i)).y(d => -y(d));

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
        .attr('order', i)
        .attr('transform', `translate(${margin.left}, ${margin.top + plotHeight + (+i * plotDist)})`)
        .attr('class', `ridge-g js-ridge-g js-ridge-g-${park.id}`)
        .on('mouseover', () => {
          !this.state.selectedPark && this._highlightPark(park.id);
        })
        .on('mouseout', () => {
          !this.state.selectedPark && this._revertParks(park.id);
        })
        .on('click', () => {
          const order = +d3.select(`.js-ridge-g-${park.id}`).attr('order');
          if (park.id !== this.state.selectedPark) {
            // for the case of swtiching
            if (this.state.selectedPark) {
              this._revertParks(this.state.selectedPark);
            }
            this._showDetail(order, park.id);
            this._highlightPark(park.id);
          } else { // toggle effects
            this._clearSelection();
          }
        });
      const c = color(park.size);
      let lineData = _.concat([0, 0], park.by_month, [0, 0]);
      let fillLine =  line(lineData).replace('M0,0', `M0,${plotDist}v${-plotDist}`) + `v${plotDist}`;
      // filling gap between two plots
      g.append('path')
        .attr('d', fillLine)
        .attr('fill', c)
        .attr('max', y(_.max(park.by_month)))
        .attr('class', `ridge-plot-fill js-ridge-fill js-ridge-fill-${park.id}`);
      g.append('path')
        .datum(lineData)
        .attr('d', line)
        .attr('max', y(_.max(park.by_month)))
        .attr('class', `ridge-plot-outline js-ridge-outlines js-ridge-outline-${park.id}`);
      // national park name
      g.append('text')
        .text(park.name.replace('National Park', 'NP').replace(' & Preserve', '&P'))
        .attr('x', 0)
        .attr('y', plotDist / 2)
        .attr('class', 'ridge-plot-name');
    }
  }

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
    for (let i in sorted) {
      const val = +d3.select(`.js-ridge-outline-${sorted[i].id}`).attr('max');
      // check if the following parks height go over the maxY
      if (+i === 0) {
        maxY = val;
      } else if (Math.max(val, +i * plotDist) > maxY) {
          maxY = Math.max(maxY, val - +i * plotDist);
        }
    }
    // animate the vertical position of each park
    let hasSelectedPark = false;
    for (let j in sorted) {
      const park = sorted[j];
      const sel = d3.select(`.js-ridge-g-${park.id}`);
      // rearrange; bring front to the vis
      parentNode.appendChild(sel.node());
      const yPos = margin.top + maxY + (hasSelectedPark && detailH) + (+j * plotDist);
      // start animation
      sel.attr('order', j)
        .transition()
        .duration(1200)
        .attr('transform', `translate(${margin.left}, ${yPos})`);
      // keep distance if a park is selected
      if (park.id === this.state.selectedPark) {
        hasSelectedPark = true;
      }
    }
    //resize the svg
    this._resizeWrapperHeight();
  }

  _clearSelection = () => {
    const id = this.state.selectedPark;
    // revert the highlight presentation to normal state
    this._revertParks(id);
    // move up the parks below the previously selected park
    d3.selectAll('.js-ridge-g')
      .filter(function() {
        return +d3.select(this).attr('order') > +d3.select(`.js-ridge-g-${id}`).attr('order');
      })
      .attr('transform', function() {
        const t = d3.select(this).attr('transform').split(',');
        return `${t[0]}, ${+t[1].slice(0, -1) - detailH})`;
      });
    this._resizeWrapperHeight();
    // update the state
    this.setState({selectedPark: null});
  }

  componentDidMount() {
    dim.w = this.props.getWidth('ridgePlots') - margin.left - margin.right;
    dim.h = this.props.data.parks.length * plotDist;
    this._drawParks();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedPark !== nextProps.selectedPark) {
      // revert park if a park is already selected
      if (this.state.selectedPark) {
        this._revertParks(this.state.selectedPark);
      }
      const id = nextProps.selectedPark;
      if (id) {
        // if a park is selected
        this._highlightPark(id);
        this._showDetail(+d3.select(`.js-ridge-g-${id}`).attr('order'), id);
      } else {
        // no park is selected after clearning
        this._clearSelection();
      }
    }
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
          { this.state.selectedPark && <span onClick={this._clearSelection}>Clear</span>}
        </div>
        <div className="col-xs-12">
          <svg id="ridge-plots" className="ridge-plots-wrapper"/>
        </div>
      </div>
    );
  }
}


export default RidgePlots;
