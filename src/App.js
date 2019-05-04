import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Context from '@prisma-cms/context'

import { buildClientSchema, GraphQLSchema, parse, print } from 'graphql';

import gql from 'graphql-tag';
import QueryBuilder from './components/QueryBuilder';


export default class App extends Component {

  static propTypes = {
    defaultQuery: PropTypes.string.isRequired,
    query: PropTypes.string,
    fetcher: PropTypes.func,
    onEditQuery: PropTypes.func,
  };

  static defaultProps = {
    defaultQuery: ``,
  }

  static contextType = Context;

  // static contextTypes = {
  //   client: PropTypes.object.isRequired,
  // }


  // static childContextTypes = {
  //   schema: PropTypes.object,
  // }


  // getChildContext() {

  //   return {
  //     schema: this.getSchema(),
  //   }

  // }


  state = {}

  // constructor(props) {

  //   super(props);

  //   // const schema = this.getSchema();


  //   const {
  //     data,
  //   } = props;

  //   const clientSchema = buildClientSchema(data);


  //   // console.log("clientSchema", { ...clientSchema });
  //   // console.log("clientSchema data", { ...data });

  //   this.state = {
  //     ...this.state,
  //     clientSchema,
  //   }

  // }


  componentWillMount() {

    this.initSchema();

    super.componentWillMount && super.componentWillMount();
  }


  componentDidUpdate(prevProps, prevState) {

    let {
      clientSchema,
    } = this.state;

    if (!clientSchema) {

      clientSchema = this.buildClientSchema();

      if (clientSchema) {
        this.setState({
          clientSchema,
        });
      }

    }

    super.componentDidUpdate && super.componentDidUpdate(prevProps, prevState);
  }


  initSchema() {

    const clientSchema = this.buildClientSchema();

    if (clientSchema) {

      Object.assign(this.state, {
        clientSchema,
      });

    }

  }


  buildClientSchema() {

    let clientSchema;

    const schema = this.getSchema();

    if (schema) {

      clientSchema = buildClientSchema({
        __schema: schema,
      });

    }

    return clientSchema;

  }


  getSchema() {

    // const {
    //   data: {
    //     __schema: schema,
    //   }
    // } = this.props;

    const {
      schema,
    } = this.context;

    return schema;
  }


  fetcher = async (props) => {

    const {
      query,
      ...other
    } = props;

    const {
      client,
    } = this.context;

    return await client.initQueryManager().query({
      query: gql(query),
      ...other
    })
      .catch(error => {
        console.error(error);
        throw error;
      })
  }


  render() {

    // const schema = this.getSchema();

    // if (!schema) {
    //   return null;
    // }


    const {
      defaultQuery,
      query,
      fetcher,
      ...other
    } = this.props;


    const {
      clientSchema,
    } = this.state;

    if (!clientSchema) {
      return null;
    }

    // return "null";

    return <QueryBuilder
      schema={clientSchema}
      fetcher={fetcher || this.fetcher}
      defaultQuery={defaultQuery}
      view={[
        // UsersView,
      ]}
      query={query}
      // onEditQuery={query => {
      //   console.log("onEditQuery", query);
      // }}
      {...other}
    />;

  }

}