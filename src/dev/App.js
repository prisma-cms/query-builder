import React, { Component } from 'react';
import PropTypes from "prop-types";

import PrismaCmsApp from '@prisma-cms/front'
import { Renderer as PrismaCmsRenderer } from '@prisma-cms/front'
import Context from '@prisma-cms/context'

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


// import UsersView from "./view/Users";


class SchemaProvider extends Component {

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


// const SchemaLoader = graphql(gql`
//   ${introspectionQuery}
// `)((props) => {


//   const {
//     data: {
//       __schema: schema,
//     }
//   } = props;

//   if (!schema) {
//     return null;
//   }



//   return <SchemaProvider
//     {...props}
//   />
// });


// class SchemaLoader extends Component {

//   static contextType = Context;

//   render() {

//     const {
//       schema,
//     } = this.context;

//     console.log("schema", schema);

//     if (!schema) {
//       return null;
//     }

//     return <SchemaProvider
//     // data={{
//     //   __schema: schema,
//     // }}
//     />

//   }
// }



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

    const {
      schema,
    } = this.context;

    return [{
      exact: true,
      path: "/",
      // component: schema ? SchemaProvider : null,
      component: SchemaProvider,
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
})(props => <DevRenderer
  {...props}
/>);

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

