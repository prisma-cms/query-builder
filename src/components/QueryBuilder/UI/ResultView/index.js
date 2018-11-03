import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ResultView extends Component {

  static propTypes = {
    query: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div>
        ResultView
      </div>
    );
  }
}
 
export default ResultView;