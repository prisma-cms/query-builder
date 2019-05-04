import React, { Component } from 'react';
import PropTypes from "prop-types";

import PrismaCmsApp from '@prisma-cms/front'
import { Renderer as PrismaCmsRenderer } from '@prisma-cms/front'

import * as queryFragments from "@prisma-cms/front/lib/schema/generated/api.fragments";

import App from "../App";



// import QueryBuilder from "../components/QueryBuilder";
import { withStyles } from 'material-ui';


// import UsersView from "./view/Users";




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
      // component: SchemaProvider,
      component: App,
    }, {
      path: "*",
      render: props => this.renderOtherPages(props),
    },];

  }


  // render() {

  //   const {
  //     pure,
  //     classes,
  //     ...other
  //   } = this.props;

  //   return pure ? <App
  //     {...other}
  //   /> : <div
  //     className={classes.root}
  //   >
  //       {super.render()}
  //     </div>

  // }

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

