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

  getDebugger() {
    return this.props.scene && this.props.scene._ransacDebugger;
  }

  async runRansac() {
    if (!this.props.scene) {
      return;
    }
    if (this.state.running) {
      return;
    }
    this.setState({
      mode: 'inliers',
      running: true
    });
    this.getDebugger().showInliers();
    const lastResult = await this.getDebugger().runRansacLive();
    this.setState({
      running: false,
      mode: 'inliers',
      lastResult
    });
  }

  toggleView() {
    if (!this.props.scene) {
      return;
    }
    if (this.state.mode === 'outliers') {
      this.getDebugger().showInliers();
      this.setState({ mode: 'inliers' });
    } else {
      this.getDebugger().showOutliers();
      this.setState({ mode: 'outliers' });
    }
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
              { !this.state.running && (
                  <div className="btn small" onClick={() => this.toggleView()}>
                    Show { this.state.mode === 'inliers' ? 'Outliers' : 'Inliers' }
                  </div>
                )
              }
            </div>
          ) : null
        }
      </div>
    );
  }
}