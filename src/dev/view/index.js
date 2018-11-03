import React, { Component } from 'react';
import PropTypes from 'prop-types';


import {
  GraphQLSchema,
} from 'graphql';

class QueryView extends Component {

  static propTypes = {
    query: PropTypes.string.isRequired,
    schema: PropTypes.instanceOf(GraphQLSchema),
  };

  render() {
    return (
      <div>
        QueryView
      </div>
    );
  }
}
 

export default QueryView;