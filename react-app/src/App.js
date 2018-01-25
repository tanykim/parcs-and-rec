import React, {Component} from 'react';
import Select from 'react-select';

import { withStore } from './store';

import Map from './Map.react';
import ParkSelect from './ParkSelect.react';
import RidgePlots from './RidgePlots.react';
import Comparison from './Comparison.react';

const data = require('./data/data.json');
const MULTI_MAX = 4;

let App = withStore('selections')(class extends Component {
  _wrapper = {
    map: null,
    ridgePlots: null,
  };

  _getWidth = (type) => {
    return this._wrapper[type]=== null ? 800 : this._wrapper[type].offsetWidth;
  }

  _selSelections = (selections) => {
    if (selections.length === MULTI_MAX + 1) return;
    this.props.store.set('selections')(selections);
  }

  _selectPark = (id) => {
    const park = data.parks.filter(park => park.id === id)[0];
    const selection = [{value: park.id, label: park.name}];
    const selections = this.props.store.get('selections').concat(selection);
    this._selSelections(selections);
  }

  _unselectPark = (id) => {
    const newOption = this.props.store.get('selections').filter(sel => sel.value !== id);
    this.props.store.set('selections')(newOption);
    this.props.store.set('isMultiMax')(false);
  }

  render() {
    // data of selected parks
    const ids = this.props.store.get('selections').map(park => park.value);
    let parks = [];
    for (let id of ids) {
      const parkData = data.parks.filter(park => park.id === id)[0];
      const {name, visitors, total, size, temperature, events} = parkData;
      parks.push({
        temperature: temperature.map(d => d.mean),
        visitors, id, name, total, size, events
      });
    }

    return (
      <div>
        <div className="row row-no-margin">
          <div className="col-xs-12 col-md-7 col-lg-8 first-md app-map">
            <div ref={div => {this._wrapper.map = div;}} />
            <Map
              data={data}
              selections={this.props.store.get('selections')}
              onSelectPark={this._selectPark}
              onUnselectPark={this._unselectPark}
              getWidth={this._getWidth} />
          </div>
          <div className="col-xs-12 col-md-5 col-lg-4 first-xs title-wrapper">
            <div className="diagonal" />
            <div className="title">
              <div className="national">National</div>
              <div className="parks">
                <div>Parks<span className="and">and</span></div>
                <div>Recreation<span className="al">al Visitors</span></div>
              </div>
            </div>
            <div className="headline">
              When is the best time to visit <br/>the {data.parks.length} National Parks in the United States?
            </div>
            <div className="park-select" id="park-select">
              <ParkSelect
                parks={data.parks}
                selections={this.props.store.get('selections')}
                onSetSelections={this._selSelections}/>
            </div>
            {this.props.store.get('selections').length > 1 &&
              <div className="comparison">
                <div className="button">See Comparison</div>
              </div>
            }
            {this.props.store.get('selections') && <div>Copmare only up to 4</div>}
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12 col-md-10 col-md-offset-1 col-lg-8 col-lg-offset-2">
            <div ref={div => {this._wrapper.ridgePlots = div;}} />
            <RidgePlots
              data={data}
              parks={parks}
              onSelectPark={this._selectPark}
              onUnselectPark={this._unselectPark}
              getWidth={this._getWidth} />
          </div>
        </div>
        {this.props.store.get('selections').length > 1 &&
          <Comparison
            parks={parks}
            maxTotalVisitor={data.max_total_visitor}
            maxSize={data.max_size}
           />
        }
        <div className="row">
          <div className="col-xs-12">
            FOOTER
          </div>
        </div>
      </div>
    );
  }
});

export default App;
