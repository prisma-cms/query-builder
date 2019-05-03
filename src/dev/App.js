import React, { Component } from 'react';
import PropTypes from "prop-types";

import PrismaCmsApp from '@prisma-cms/front'
import { Renderer as PrismaCmsRenderer } from '@prisma-cms/front'

import * as queryFragments from "@prisma-cms/front/lib/schema/generated/api.fragments";

import App from "../App";

import {
  buildClientSchema,
  introspectionQuery,
} from "graphql";

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';


import QueryBuilder from "../components/QueryBuilder";
import { withStyles } from 'material-ui';


import UsersView from "./view/Users";


class SchemaProvider extends Component {

  static propTypes = {

  };

  static contextTypes = {
    client: PropTypes.object.isRequired,
  }


  static childContextTypes = {
    schema: PropTypes.object,
  }


  getChildContext() {

    return {
      schema: this.getSchema(),
    }

  }

  state = {}


  constructor(props) {

    super(props);

    // const schema = this.getSchema();


    const {
      data,
    } = props;

    const clientSchema = buildClientSchema(data);



    this.state = {
      ...this.state,
      clientSchema,
    }

  }


  getSchema() {

    const {
      data: {
        __schema: schema,
      }
    } = this.props;

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


    const schema = this.getSchema();




    if (!schema) {
      return null;
    }


    const {
      clientSchema,
    } = this.state;

    if (!clientSchema) {
      return null;
    }

    // return "null";

    return <QueryBuilder
      schema={clientSchema}
      fetcher={this.fetcher}
      defaultQuery=""
      view={[
        UsersView,
      ]}
    />;

  }

}


const SchemaLoader = graphql(gql`
  ${introspectionQuery}
`)((props) => {


  const {
    data: {
      __schema: schema,
    }
  } = props;

  if (!schema) {
    return null;
  }



  return <SchemaProvider
    {...props}
  />
});



class DevRenderer extends PrismaCmsRenderer {


  static propTypes = {
    ...PrismaCmsRenderer.propTypes,
    pure: PropTypes.bool.isRequired,
  }

  static defaultProps = {
    ...PrismaCmsRenderer.defaultProps,
    pure: false,
  }

  getRoutes() {

    return [{
      exact: true,
      path: "/",
      component: SchemaLoader,
    }, {
      path: "*",
      render: props => this.renderOtherPages(props),
    },];

  }


  render() {

    const {
      pure,
      classes,
      ...other
    } = this.props;

    return pure ? <App
      {...other}
    /> : <div
      className={classes.root}
    >
        {super.render()}
      </div>

  }
}


const Renderer = withStyles({
  root: {
    // border: "1px solid red",
    height: "100vh",
    display: "flex",
    flexDirection: "column",

    "& #Renderer--body": {
      flex: 1,
      overflow: "auto",

      "& > div": {
        height: "100%",
      },
    },
  },
})(DevRenderer);

export default class DevApp extends Component {

  static propTypes = {
    queryFragments: PropTypes.object.isRequired,
  }

  static defaultProps = {
    queryFragments,
    lang: "ru",
  }

  render() {

    const {
      queryFragments,
      ...other
    } = this.props;

    return <PrismaCmsApp
      queryFragments={queryFragments}
      Renderer={Renderer}
      // pure={true}
      {...other}
    />
  }
}

