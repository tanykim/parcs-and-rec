/******
/* React Component: Comparison of multiple parks
******/

import React, { Component } from 'react';

import SizeAndVisitor from './SizeAndVisitor.react';
import Visitors from './Visitors.react';

class Comparison extends Component {
  _wrapper = {
    sizeAndVisitor: null,
    visitors: null,
  };

  _getWidth = (type) => {
    return this._wrapper[type] === null ? 800 : this._wrapper[type].offsetWidth;
  }

  render() {
    const names = this.props.parks.map((park, i) =>
      (<span key={i} className="label">
        <span className={`label-bg label-${i}`}/>{park.name}
      </span>)
    );
    return (
      <div className="row center-xs comparison">
        <div className="col-xs-12">
          {names}
        </div>
        <div className="col-xs-12 col-md-6 col-lg-4">
          <div ref={div => {this._wrapper.sizeAndVisitor = div;}} />
          <SizeAndVisitor {...this.props} getWidth={this._getWidth}/>
        </div>
        <div className="col-xs-12 col-md-10 col-lg-8 col-lg-offset-2">
          <div ref={div => {this._wrapper.visitors = div;}} />
          <Visitors {...this.props} getWidth={this._getWidth}/>
        </div>
        <div className="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2 js-comp-temp" />
        <div className="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2 js-comp-rain" />
      </div>
    )
  }
}

export default Comparison;
