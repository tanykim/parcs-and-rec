/******
/* React Component: for Ridge Plots of National Parks visitors data
******/
// @flow

import * as d3 from 'd3';
import * as topojson from 'topojson';
import _ from 'lodash';
import React, { Component } from 'react';

const world = require('./data/worldmap-110m.json');
const usa = require('./data/usa-110m.json');
let dim = {};

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

  _reset(id) {
    d3.select(`.js-park-ridge-${id}`)
      .classed('active', false)
      .classed('defocused', false);
    d3.select('#worldmap')
      .transition()
      .duration(720)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  _defocus(id) {
    d3.select(`.js-park-ridge-${id}`)
      .classed('active', false)
      .classed('defocused', true);
  }

  _zoom(id) {
      // TDOO: bring it front when selected, change size circle style
      d3.select(`.js-park-ridge-${id}`)
        .classed('active', true)
        .classed('defocused', false);
      const sel = d3.select(`.js-park-${id}`);
      const x = sel.attr('cx');
      const y = sel.attr('cy');
      // TODO: scale dynamically
      const scale = 10;
      d3.select('#worldmap')
        .transition()
        .call(
          this.zoom.transform,
          d3.zoomIdentity
            .translate(dim.w / 2 - scale * x, dim.h / 2 - scale * y)
            .scale(scale),
        );
  }

  _drawRidges(data) {
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

      // park data is an array of three points [x, y] and the id
      const parks = lat.parks_data;
      if (parks) {
        for (let park of parks) {
          const id = park[3];
          g.append('path')
            .datum(park.splice(0, 3))
            .attr('d', line)
            .attr('stroke-width', 1.2)
            .attr('class', `ridge-parks js-park-ridge-${id}`)
        }
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
      .attr('class', d => `map-park-size js-park-${d.id}`)
      .on('click', d => {
        // check if already selected
        if (this.props.selections.map(p => p.value).indexOf(d.id) === -1) {
          this.props.onSelectPark(d.id);
        } else {
          this.props.onUnselectPark(d.id);
        }
      });
  }

  _drawWorldMap() {
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
    // when dataset is swtiched
    if (this.props.selections.length !== nextProps.selections.length) {
      // check if new park is selected
      if (nextProps.selections.length > this.props.selections.length) {
        // zoom in to the new park
        this._zoom(nextProps.selections[nextProps.selections.length - 1].value);

        // dehighlight the previous parks
        if (this.props.selections.length > 0) {
          for (let sel of this.props.selections) {
            this._defocus(sel.value);
          }
        }
      // if park(s) deselected
      } else {
        const current = this.props.selections.map(p => p.value);
        const next = nextProps.selections.map(p => p.value);
        const removedParks = _.difference(current, next);
        for (let park of removedParks) {
          this._reset(park);
        }
        // zoom to the last selected one
        if (next.length > 0) {
          this._zoom(next[next.length -1]);
        }
      }
    }
  }

  componentDidMount() {
    dim = {w: this.props.getWidth('map'), h: 600};
    const data = this.props.data;
    this._drawWorldMap();
    this._drawRidges(data);
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
