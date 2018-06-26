import React, { Component } from 'react';

import './RansacController.css';

export default class RansacController extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      running: false,
      lastResult: null
    };
  }

  async runRansac() {
    if (!this.props.scene) {
      return;
    }
    this.setState({ running: true });
    const lastResult = await this.props.scene.runRansacLive();
    this.setState({ running: false, lastResult });
  }

  render() {
    return (
      <div className="RansacController">
        {
          this.state.running ? (
            <div className="btn disabled">
              Running...
            </div>
          ) : (
            <div className="btn" onClick={() => this.runRansac()}>
              Run RANSAC
            </div>
          )
        }
        {
          this.state.lastResult ? (
            <div>
              <h2>Last RANSAC Run</h2>
              <div>Inlier points: {this.state.lastResult.inliers.length}</div>
              <div>Remaining outliers: {this.state.lastResult.outliers.length}</div>
            </div>
          ) : null
        }
      </div>
    );
  }
}