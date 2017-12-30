/******
/* React Component: for Ridge Plots of National Parks visitors data
******/
// @flow

import * as d3 from 'd3';
import * as topojson from 'topojson';
import React, { Component } from 'react';

const world = require('./data/worldmap-110m.json');
const usa = require('./data/usa-110m.json');

class Map extends Component {

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

  _drawOverview(data, dim) {
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
        .attr('stroke-width', 1.2)
        .attr('class', `ridge-${lat.parks_data ? 'parks' : 'blank'} js-lat-lines-${i}`)
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
          .attr('stroke-width', 1.2)
          .attr('class', `ridge-parks js-lat-parks-${i}`);
      }
    }

    // max radius is 30, proportioanl to the acreage
    const r = d3.scaleLinear().range([0, 900]).domain([0, data.max_size])
    // add mark on each park
    g.selectAll('circle')
      .data(data.parks)
      .enter()
      .append('circle')
      .attr('cx', d => this.projection([d.lon, d.lat])[0])
      .attr('cy', d => this.projection([d.lon, d.lat])[1])
      .attr('r', d => Math.sqrt(r(d.size)))
      .attr('class', 'map-park-size')
      .on('click', d => {
        // console.log(d.name, d.state, d.total);
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
      .attr('class', 'map-usa-states js-usa-path');
    g.selectAll('.js-country-path')
      .data(worldPath)
      .enter()
      .append('path')
      .attr('d', this.path)
      .attr('class', (country) =>
        `map-${country.id === CODE_USA ? 'usa' : 'neighbor'} js-country-path js-country-path-${country.id}`
      );

    // make a clipping mask path for the ridge plots from the united states map
    d3.select('#map-clip-path')
      .append('path')
      .attr('d', d3.select(`.js-country-path-${CODE_USA}`).attr('d'));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedPark !== nextProps.selectedPark) {
      console.log(nextProps.selectedPark);
    }
  }

  componentDidMount() {
    const dim = {w: this.props.getWidth('map'), h: 600};
    const data = this.props.data;
    this._drawWorldMap(dim);
    this._drawOverview(data, dim);
  }

  render() {
    return (
      <svg className="map-wrapper" id="worldmap">
        <defs><clipPath id="map-clip-path"></clipPath></defs>
      </svg>
    );
  }
}

export default Map;
