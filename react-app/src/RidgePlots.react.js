/******
/* React Component: for Ridge Plots of National Parks visitors data
******/

import * as d3 from 'd3';
import * as topojson from 'topojson';
import _ from 'lodash';
import React, { Component } from 'react';

const data = require('./data/data.json');
const world = require('./data/worldmap-110m.json');
const usa = require('./data/usa-110m.json');

class RidgePlots extends Component {

  // mapping
  projection = d3.geoMercator();
  path = d3.geoPath().projection(this.projection)
  zoom = d3.zoom().scaleExtent([0.3, 4])
    .on('zoom', () => {
      // scale up the boundary path
      d3
        .select('.svg-g')
        .style('stroke-width', 1.2 / d3.event.transform.k + 'px')
        .attr('transform', d3.event.transform);
    });

  _drawOverview(dim) {

    // max total points
    const maxTotal = data.max_total_visitor;
    const valAxis = d3.scaleLinear().range([0, dim.h / 3]).domain([0, maxTotal]);

    const g = d3.select('.svg-g');
    // add line graph by each byLat
    for (const i in data.by_latittude) {
      const lat = data.by_latittude[i];

      // draw the group of base lines at each latitude
      // clip the path with the boundary of United States
      g.selectAll(`.js-lat-lines-${i}`)
        .data(lat.base_lines)
        .enter()
        .append('line')
        .attr('x1', (d) => this.projection([d[0], lat.lat_rounded])[0])
        .attr('y1', (d) => this.projection([d[0], lat.lat_rounded])[1])
        .attr('x2', (d) => this.projection([d[1], lat.lat_rounded])[0])
        .attr('y2', (d) => this.projection([d[1], lat.lat_rounded])[1])
        .attr('stroke', lat.parks_data ? 'green' : '#d0e2aa')
        .attr('stroke-width', 1.2)
        .attr('class', `js-lat-lines-${i}`)
        .attr('clip-path', 'url(#map-clip-path)');

      // draw each park, they are not clipped
      const line = d3.line()
        .x(d => this.projection([d[0], 0])[0])
        .y(d => this.projection([0, lat.lat_rounded])[1] - valAxis(d[1]))
        .curve(d3.curveMonotoneX);

      if (lat.parks_data) {
        g.selectAll(`.js-lat-parks-${i}`)
          .data(lat.parks_data)
          .enter()
          .append('path')
          .datum(d => d)
          .attr('d', line)
          .attr('stroke', 'green')
          .attr('stroke-width', 1.2)
          .attr('stroke-linecap', 'round')
          .attr('fill', 'white')
          .attr('class', `js-lat-parks-${i}`);
      }
    }

    // add mark on each park
    g.selectAll('circle')
      .data(data.parks)
      .enter()
      .append('circle')
      .attr('cx', d => this.projection([d.lon, d.lat])[0])
      .attr('cy', d => this.projection([d.lon, d.lat])[1])
      .attr('r', 5)
      .style('fill', 'red')
      .style('opacity', 0.2)
      .on('mouseover', d => {
        console.log(d.name, d.state, d.total);
      });
  }

  _drawWorldMap(dim) {
    // set the svg
    const svg = d3
      .select('#worldmap')
      .attr('width', dim.w)
      .attr('height', dim.h);

    // TODO: figure out dynamically with the given dim width and height
    this.projection.scale(dim.w * 0.6).translate([dim.w * 1.4, dim.h * 1.8]);

    // prevents click to zoom
    const stopped = () => {
      if (d3.event.defaultPrevented) d3.event.stopPropagation();
    };

    // scroll to zoom, area of non-country on the map clicked, zoom out back.
    svg.call(this.zoom);
    svg.on('click', stopped, true);

    // geo data
    const CODE_USA = 840;
    const neighbors = [124, 484]; // Candada and Mexico
    const worldPath = topojson.feature(world, world.objects.countries).features
      .filter(d =>  d.id === CODE_USA || neighbors.indexOf(d.id) > -1);
    const usaPath = topojson.feature(usa, usa.objects.states).features;

    // draw USA states & country boundary
    const g = svg
      .append('g')
      .attr('class', 'svg-g');

    g.selectAll('.js-usa-path')
      .data(usaPath)
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', 'usa-path js-usa-path')
      .style('fill', 'white')
      .style('stroke', '#efefef');
    g.selectAll('.js-country-path')
      .data(worldPath)
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', (country) => `country-path js-country-path js-country-path-${country.id}`)
      .style('fill', (country) => country.id === CODE_USA ? 'none' : '#efefef')
      .style('stroke', '#cccccc');

    // make a clipping mask path for the ridge plots from the united states map
    d3.select('#map-clip-path')
      .append('path')
      .attr('d', d3.select(`.js-country-path-${CODE_USA}`).attr('d'));
  }

  _drawParks() {
    const plotHeight = 60; // base height of each plot
    const plotDist = 14; // distance between two plots
    const yRatio = 4; // magnifying ratio of plotting value to plot height
    const dim = {w: 600, h: plotDist * data.parks.length};
    // have margin on the top above the line
    const margin = {top: plotHeight * yRatio + 20, right: 20, bottom: 40, left: 60};
    const g = d3.select('#ridge-plots')
      .attr('width', dim.w + margin.left + margin.right)
      .attr('height', dim.h + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear().range([0, dim.w]).domain([0, 15]);
    const maxMonthly = _.max(data.parks.map(d => _.max(d.by_month)));
    const y = d3.scaleLinear().range([0, plotHeight]).domain([0, maxMonthly / yRatio]);
    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => -y(d));

    const color = d3.scaleThreshold()
        .domain(data.seasonal_domain)
        .range(['#fafad2','#d0e2aa','#a6c983','#7eb060','#56973e','#2d7e1c','#006400']);

    const ordered = _.orderBy(data.parks, d => d.total).reverse();
    for (let i in ordered) {
      const c = color(ordered[i].seasonal);
      g.append('path')
        .datum(_.concat([0, 0], ordered[i].by_month, [0, 0]))
        .attr('fill', c)
        // .attr('fill-opacity', 0.8)
        .attr('stroke', c)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1.5)
        .attr('d', line)
        .attr('transform', `translate(0, ${+i * plotDist})`);
    }
  }

  componentDidMount() {
    const dim = {w: 1600, h: 600};
    this._drawWorldMap(dim);
    this._drawOverview(dim);
    this._drawParks();
  }


  render() {
    return (
        <div>
          <svg className="map-wrapper" id="worldmap">
            <defs><clipPath id="map-clip-path"></clipPath></defs>
          </svg>
          <svg id="ridge-plots" />
        </div>
    );
  }
}


export default RidgePlots;