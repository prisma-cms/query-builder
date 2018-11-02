import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { buildClientSchema, GraphQLSchema, parse, print } from 'graphql';

class QueryBuilder extends Component {

  static propTypes = {
    views: PropTypes.arrayOf(PropTypes.func).isRequired,
    inEditMode: PropTypes.bool.isRequired,
    query: PropTypes.string.isRequired,
    schema: PropTypes.instanceOf(GraphQLSchema),
  };

  render() {
    return (
      <div>
        My awesome component
      </div>
    );
  }
}
 
export default QueryBuilder;