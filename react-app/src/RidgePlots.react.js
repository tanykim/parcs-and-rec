/******
/* React Component: for Ridge Plots of National Parks visitors data
******/

import * as d3 from 'd3';
import React, { Component } from 'react';
import * as topojson from 'topojson';

const data = require('./data/data.json');
const world = require('./data/worldmap-110m.json');

// TODO: get only the three countries + state boundaries
// geo data by country
const CODE_USA = 840;
const neighbors = [124, 484]; // Candada and Mexico
const geoFeatures = topojson.feature(world, world.objects.countries).features
  .filter(d =>  d.id === CODE_USA || neighbors.indexOf(d.id) > -1);

class RidgePlots extends Component {

  // mapping
  projection = d3.geoMercator();
  path = d3.geoPath().projection(this.projection)
  zoom = d3.zoom().scaleExtent([0.3, 4])
    .on('zoom', () => {
      // scale up the boundary path
      d3
        .select('.svg-g')
        .style('stroke-width', 1.5 / d3.event.transform.k + 'px')
        .attr('transform', d3.event.transform);
    });

  _drawRidgeGraph(dim) {

    // max total points
    const maxTotal = data.max_total_visitor;
    const valAxis = d3.scaleLinear().range([0, dim.h / 3]).domain([0, maxTotal]);

    const g = d3.select('.svg-g');
    // add line graph by each byLat
    for (const lat of data.by_latittude) {
      const line = d3.line()
        .x(d => this.projection([d[0], 0])[0])
        .y(d => this.projection([0, lat.lat_rounded])[1] - valAxis(d[1]))
        .curve(d3.curveMonotoneX);
      g.append('path')
        .datum(lat.parks_data)
        .attr('fill', 'white')
        .attr('stroke', lat.parks_data.length > 2 ? 'green' : '#efefef')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line);
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
        console.log(d.name, d.state_abbr, d.total);
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

    // draw country boundary
    const g = svg
      .append('g')
      .attr('class', 'svg-g');

    g.selectAll('.js-country-path')
      .data(geoFeatures)
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', 'country-path js-country-path')
      .style('fill', (country) => country.id === CODE_USA ? '#ffffff' : '#efefef')
      .style('stroke', '#cccccc');
  }

  componentDidMount() {
    const dim = {w: 1600, h: 600};
    this._drawWorldMap(dim);
    this._drawRidgeGraph(dim);
  }

  render() {
    return (
      <div>
        <div className="map-wrapper">
          <svg id="worldmap" />
        </div>
      </div>
    );
  }
}

export default RidgePlots;