/******
/* React Component: for Ridge Plots of National Parks visitors data
******/

import * as d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import SortSelect from './SortSelect.react';
import {withStore} from './store';

// distance between two plots
const plotDist = 20;
const margin = {top: 20, right: 40, bottom: 20, left: 300};
const dim = {w: null, h: null};
const plotHeight = 240;
const x = d3.scaleLinear();
const y = d3.scaleLinear().range([plotHeight, 0]);
const line = d3.line();

let RidgePlots = withStore()(class extends Component {
  // dim other parks when a park is selected
  _dimParks(id) {
    d3.selectAll('.js-ridge-g')
      .filter(d => d !== id)
      .classed('dimmed', true)
      .classed('active', false)
      .selectAll('.js-ridge-outlines').attr('d', `M0,0h${dim.w}`);
  }

  // mouse over & out does not work if there's selected park(s)
  _mouseOver(id) {
    if (this.props.store.get('selections').length > 0) return false;
    this._dimParks(id);
    d3.select(`.js-ridge-g-${id}`)
      .classed('active', true);
  }

  _mouseOut(id) {
    if (this.props.store.get('selections').length > 0) return false;
    d3.selectAll('.js-ridge-g')
      .classed('dimmed', false)
      .selectAll('.js-ridge-outlines').attr('d', line);
    d3.select(`.js-ridge-g-${id}`).classed('active', false);
  }

  // highlight a selected park
  _highlightPark(id, hasPrev) {
    !hasPrev && this._dimParks(id);
    d3.select(`.js-ridge-g-${id}`)
      .classed('dimmed', false)
      .classed('defocused', false)
      .classed('active', true);
    d3.select(`.js-ridge-outline-${id}`).attr('d', line);
  }

  // when a new park is selected, defocus previously selected ones
  _defocus(id) {
    d3.select(`.js-ridge-g-${id}`)
      .classed('dimmed', false)
      .classed('defocused', true)
      .classed('active', false);
    d3.select(`.js-ridge-outline-${id}`).attr('d', line);
  }

  // when a park is deselected (still there's a selected one)
  // reset to the dimmed status
  _reset = (id) => {
    d3.select(`.js-ridge-g-${id}`)
      .classed('dimmed', true)
      .classed('defocused', false)
      .classed('active', false);
    d3.select(`.js-ridge-outline-${id}`).attr('d', `M0,0h${dim.w}`);
  }

  // revert to the normal status
  _revertToNormal = () => {
    // move up the parks below the previously selected park
    d3.selectAll('.js-ridge-g')
      .classed('dimmed', false)
      .classed('defocused', false)
      .classed('active', false);
  }

  _selectPark = (id) => {
    const selections = this.props.store.get('selections').map(sel => sel.value);
    if (selections.indexOf(id) === -1) {
      this.props.onSelectPark(id);
    } else {
      this.props.onUnselectPark(id);
    }
  }

  _sortParks = (parks, optionVal) => {
    const option = optionVal.split('-');
    let sorted = _.orderBy(parks, d => d[option[0]]);
    sorted = option[1] === 'desc' ? sorted.reverse() : sorted;
    return sorted;
  }

  _drawParks() {
    const data = this.props.data;
    const svg = d3.select('#ridge-plots')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom + plotHeight);

    // add two points on each side of X axis
    x.range([0, dim.w]).domain([0, 15]);
    const maxMonthly = _.max(data.parks.map(d => _.max(d.visitors)));
    // since the y base is 0, do not swap range
    y.domain([0, maxMonthly]);
    line.x((d, i) => x(i)).y(d => y(d) - plotHeight);

    // put y axis
    svg.append('g')
      .call(d3.axisRight(y).tickFormat(d => d3.format('.2s')(d)))
      .attr('transform', `translate(${margin.left + dim.w}, ${margin.top})`);

    // sort the national parks
    const sorted = this._sortParks(data.parks, this.props.store.get('sortOption'));
    for (let i in sorted) {
      const park = sorted[i];
      const g = svg
        .append('g')
        .datum(park.id)
        .attr('order', i)
        .attr('transform', `translate(${margin.left}, ${margin.top + plotHeight + (+i * plotDist)})`)
        .attr('class', `ridge-g js-ridge-g js-ridge-g-${park.id}`)
        .on('mouseover', () => {
          this._mouseOver(park.id);
        })
        .on('mouseout', () => {
          this._mouseOut(park.id);
        })
        .on('click', () => {
          this._selectPark(park.id);
        });
      // bind line data for switching path form (flat line vs line graphs)
      let lineData = _.concat([0, 0], park.visitors, [0, 0]);
       g.append('path')
        .datum(lineData)
        .attr('d', line)
        .style('fill', 'white')
        .attr('max', y(_.max(park.visitors)))
        .attr('class', `ridge-plot-outline js-ridge-outlines js-ridge-outline-${park.id}`);
      // national park name
      g.append('text')
        .text(park.name.replace('National Park', 'NP').replace(' & Preserve', '&P'))
        .attr('x', 0)
        .attr('y', plotDist / 2)
        .attr('class', 'ridge-plot-name')
        .on('mouseover', function() {
          d3.select(this).classed('hover', true);
        })
        .on('mouseout', function() {
          d3.select(this).classed('hover', false);
        });
      //monthly lines - by default they are hidden
      for (let i in park.visitors) {
        const xPos = x(+i + 2);
        const yPos = y(park.visitors[i]) - plotHeight;
        g.append('line')
          .attr('x1', xPos)
          .attr('x2', xPos)
          .attr('y1', yPos)
          .attr('y2', 0)
          .attr('class', 'ridge-plot-month month-line');
        g.append('text')
          .attr('x', xPos)
          .attr('y', plotDist / 2)
          .text(moment(+i + 1, 'M').format('MMM'))
          .attr('class', 'ridge-plot-month month-label');
      }
    }
  }

  _onOptionChange = (option) => {
    // sort the parks
    const sorted = this._sortParks(this.props.data.parks, option);
    // animate the vertical position of each park
    const parentNode = d3.select('#ridge-plots').node();
    for (let j in sorted) {
      const park = sorted[j];
      const sel = d3.select(`.js-ridge-g-${park.id}`);
      // rearrange; bring front to the vis
      parentNode.appendChild(sel.node());
      // start animation
      const yPos = margin.top + plotHeight + (+j * plotDist);
      sel.attr('order', j)
        .transition()
        .duration(1200)
        .attr('transform', `translate(${margin.left}, ${yPos})`);
    }
  }

  componentWillReceiveProps(nextProps) {
    const currentSel = this.props.selections;
    const nextSel = nextProps.selections;
    // when dataset is swtiched
    if (currentSel.length !== nextSel.length) {
      // check if new park is selected
      if (nextSel.length > currentSel.length) {
        // highlight the park
        const id = nextSel[nextSel.length - 1].value;
        this._highlightPark(id);
        // dehighlight the previous parks
        if (currentSel.length > 0) {
          for (let sel of currentSel) {
            this._defocus(sel.value);
          }
        }
      // if park(s) deselected
      } else {
        const current = currentSel.map(p => p.value);
        const next = nextSel.map(p => p.value);
        const removedParks = _.difference(current, next);
        // still selected parks are remained
        if (next.length > 0 ) {
          for (let park of removedParks) {
            this._reset(park);
          }
          for (let i = 0; i < next.length - 1; i++) {
            this._defocus(next[i]);
          }
          const id = next[next.length -1];
          // do not dim other previously selected parks
          this._highlightPark(id, true);
        } else {
          this._revertToNormal(nextSel.length);
        }
      }
    }
  }

  componentDidMount() {
    dim.w = this.props.getWidth('ridgePlots') - margin.left - margin.right;
    dim.h = this.props.data.parks.length * plotDist;
    this._drawParks();
  }

  render() {
    return (
      <div className="row ridge-plots-wrapper">
        <div className="col-xs-12 col-md-6 col-md-offset-3 col-lg-4 col-lg-offset-4">
          <SortSelect onOptionChange={this._onOptionChange}/>
        </div>
        <div className="col-xs-12 ridge-plots" >
          <svg id="ridge-plots" />
        </div>
      </div>
    );
  }
});

export default RidgePlots;
