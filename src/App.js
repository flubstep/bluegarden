import React, { Component } from 'react';
import LidarScene from './scene/LidarScene';

import './App.css';

//const TEST_JSON_URL = '/data/1815.linecompressed.json';
//const TEST_JSON_URL = '/data/1815.buffered.json';
const TEST_JSON_URL = '/data/1815.small_uncompressed.json';

class App extends Component {

  componentDidMount() {
    this.scene = new LidarScene();
    this.scene.initialize(this.refs.sceneContainer);
    this.loadPointsFromUrl(TEST_JSON_URL);
    window.scene = this.scene;
  }

  async loadPointsFromUrl(url) {
    console.time('network data from url');
    const response = await fetch(url);
    const data = await response.json();
    console.timeEnd('network data from url');
    console.time('add points to buffer');
    this.scene.addDataFromBuffer(data);
    console.timeEnd('add points to buffer');
  }

  render() {
    return (
      <div className="App">
        <div
          ref="sceneContainer"
          style={{
            height: 640,
            width: 1080,
            backgroundColor: 'black'
          }}
        >
        </div>
      </div>
    );
  }
}

export default App;
