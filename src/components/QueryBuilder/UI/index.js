
/**
 * Иерархия:
 * 
 * Document: {Definition}
 *  kind
 *  definitions: {Definition}
 *    kind: OperationDefinition
 *    name: {}
 *    operation: query | mutation | subscription
 *    alias {}
 *    arguments: [{}]
 *    directives: [{}]
 *    variableDefinitions: [{}]: 
 *      kind
 *      defaultValue: {}
 *        fields: [{}]:
 *          kind
 *          name: {}
 *          value: {}
 *      type: {}
 *      variable: {}
 *        kind: 
 *        name: {}
 *    selectionSet:
 *      kind
 *      selections: [{Definition}]
 */


import React, { Component } from 'react';
import PropTypes from 'prop-types';


import {
  buildClientSchema,
  GraphQLSchema,
  parse,
  validate,
  print,
  type,
  Source,
} from 'graphql';

// import {
//   parse,
// } from "graphql-js/dist/language";

import { withStyles, Button, Grid, Typography, Paper } from 'material-ui';

import {
  getAutocompleteSuggestions,
  getTokenAtPosition,
  getTypeInfo,
} from 'graphql-language-service-interface/dist/getAutocompleteSuggestions';

import { CharacterStream, onlineParser } from 'graphql-language-service-parser';


import {
  Position,
  getASTNodeAtPosition,
} from 'graphql-language-service-utils';
import { TextField } from 'material-ui';


import { ResultViewer } from 'graphiql/dist/components/ResultViewer';

const styles = theme => {

  return {
    root: {
      height: "100%",
      overflow: "auto",
      // margin: "10px 0",
      // padding: "20px 0",
      // borderTop: "1px solid #ddd",
      // borderBottom: "1px solid #ddd",

      "& button span": {
        textTransform: "none",
      },
    },
    node: {
      margin: "10px 0 10px 20px",
    },
    block: {
      margin: "10px 0 10px 20px",
    },
    paper: {
      margin: "10px 0",
      padding: 10,
    },
    definition: {

    },
  }

}

class QueryBuilderUI extends Component {

  static propTypes = {
    setQuery: PropTypes.func.isRequired,
    query: PropTypes.string.isRequired,
    schema: PropTypes.instanceOf(GraphQLSchema),
    classes: PropTypes.object.isRequired,
  };


  state = {
    ...super.state,
    point: 0,
  }


  constructor(props) {

    super(props);

    let {
      query,
    } = props;

    if (this.isValidQuery(query)) {

      Object.assign(this.state, {
        query,
      })

    }

  }




  isValidQuery(query) {

    let parseError;

    try {

      query && parse(query);


    }
    catch (error) {

      console.error("isValidQuery", error);

      parseError = error;
    }

    Object.assign(this.state, {
      parseError,
    });

    return !parseError;
  }


  componentWillReceiveProps(nextProps, nextState) {

    const {
      query: nextQuery,
    } = nextProps;

    const {
      query,
    } = this.props;

    if ((nextQuery || query) && nextQuery !== query && this.isValidQuery(nextQuery)) {
      this.setState({
        query: nextQuery,
      });
    }

    super.componentWillReceiveProps && super.componentWillReceiveProps(nextProps, nextState);
  }

  // componentDidUpdate(prevProps, prevState) {

  //   const {
  //     query: prevQuery,
  //   } = prevProps;

  //   const {
  //     query,
  //   } = this.props;

  //   if ((prevQuery || query) && prevQuery !== query) {
  //     this.assignQuery();
  //   }

  // }


  renderDocumentFromSchema() {

    let elements = [];

    const {
      schema,
    } = this.props;

    const {
      query,
    } = this.state;

    let AST


    AST = query && parse(query);

    if (!AST) {
      return null;
    }

    // console.log("renderDocumentFromSchema query", query);
    console.log("renderDocumentFromSchema AST", AST);

    let errors = AST && validate(schema, AST);

    // console.log("renderDocumentFromSchema AST validate");



    return <div>

      {errors && errors.length ? <div>
        {errors.map((error, index) => <Typography
          key={index}
          color="error"
        >
          {error.toString()}
        </Typography>)}
      </div> : null}

      <div>
        {this.renderDefinition(AST)}
      </div>

    </div>;

  }




  addVariable(currentState, variablesState) {

    const {
      token: {
        string,
      },
    } = currentState;

    const isStart = string === "$";

    let variableArray;


    let {
      variables,
      args,
    } = variablesState;


    if (isStart) {
      variableArray = [];
      variables.push(variableArray);
    }
    else {
      variableArray = variables[variables.length - 1];
    }

    variableArray.push(currentState);

  }




  injectQuery(subQuery, line, col) {

    let {
      query,
    } = this.props;

    // console.log("injectQuery query", this.props.query);

    // console.log("injectQuery", subQuery, line, col);

    let lines = query.split('\n');

    let editLine = lines[line];

    // console.log("injectQuery editLine", editLine);


    if (editLine !== undefined) {

      editLine = this.replaceRange(editLine, col, col, subQuery);

      lines[line] = editLine;

      query = lines.join('\n');
    }

    // console.log("injectQuery editLine2", editLine);

    // console.log("injectQuery 2", query);

    return this.setQuery(query);
  }

  replaceRange(string, start, end, substitute) {
    return string.substring(0, start) + substitute + string.substring(end);
  }


  updateNode(node, value) {

    const {
      loc: {
        start,
        end,
        source: {
          body: query,
        },
      },
      kind,
    } = node;


    switch (kind) {

      case "StringValue":

        value = `"${value.replace(/\\/g, '\\\\').replace(/\"/g, '\\"')}"`;

        break;

    }

    const newQuery = this.replaceRange(query, start, end, value);

    console.log("newQuery", newQuery);

    this.setQuery(newQuery);
  }


  setQuery(query) {

    const {
      setQuery,
    } = this.props;

    return setQuery(query);

  }


  renderDefinition(node) {

    let output = [];


    console.log("renderDefinition node", node);

    const {
      kind,
    } = node;

    switch (kind) {

      case "Document":

        output.push(this.renderDocument(node))

        break;

      case "OperationDefinition":
      case "Field":

        output.push(this.renderOperationDefinition(node))

        break;

    }

    return output;
  }


  renderDocument(node) {

    let output;

    const {
      kind,
      definitions,
    } = node;

    const {
      classes,
    } = this.props;

    return <Paper
      key={kind}
      className={classes.paper}
    >
      Document

      <div>
        {this.renderDefinitions(definitions)}
      </div>
    </Paper>
  }


  renderOperationDefinition(node) {

    let output;

    const {
      kind,
      // definitions,
      name,
      alias,
      selectionSet,
      directives,
    } = node;

    const {
      classes,
    } = this.props;


    const {
      selections,
    } = selectionSet || {};


    // console.log("renderOperationDefinition node", node);

    const nameValue = name && name.value || "";

    const aliasValue = alias && alias.value || "";


    let directivesList = [];

    directives && directives.map(n => {

      const {
        arguments: args,
        name: directiveName,
      } = n;

      console.log("Directive", n);

      const directiveNameValue = directiveName && directiveName.value || "";

      directivesList.push(<div
        key={directiveNameValue}
        className={classes.block}
      >
        DirectiveName: {directiveNameValue}

        {args && args.map(arg => {

          const {
            name,
          } = arg;

          return <div
            key={name.value}
          >
            {this.renderArgument(arg)}
          </div>
        }) || null}
      </div>);
    });

    return <div
      key={`${kind}_${nameValue}_${aliasValue}`}
      className={[classes.definition, kind].join(" ")}
    >
      <Typography
        variant="title"
      >
        Kind: {kind}
      </Typography>

      <Typography
        variant="subheading"
      >
        {nameValue} {aliasValue ? ` (${aliasValue})` : ""}
      </Typography>

      {directivesList}

      Selections: {selections && selections.map(n => {
        return this.renderDefinition(n)
      }) || null}

    </div>
  }


  renderArgument(node) {

    console.log("renderArgument", node);

    let output;

    const {
      value,
      name,
    } = node;

    const {
      kind: valueKind,
      name: valueName,
      value: valueValue,
    } = value;


    switch (valueKind) {

      case "Variable":

        output = <Typography
          color="textSecondary"
        >
          Variable: ${valueName.value}
        </Typography>

        break;

      case "StringValue":
        output = <TextField
          label={name.value}
          value={valueValue || ""}
          onChange={event => this.onChangeArgument(event, value)}
        />
          ;

        break;

    }

    return output;
  }


  onChangeArgument(event, node) {

    const {
      value,
    } = event.target;

    const {
      loc: {

      },
    } = node;

    console.log("onChangeArgument", node, value);

    return this.updateNode(node, value);

  }


  renderDefinitions(definitions) {

    return definitions && definitions.map(definition => this.renderDefinition(definition)) || null;
  }


  renderDefinition___(node) {

    const {
      kind,
      name,
      alias,
      loc,
      definitions,
      operation,
      directives,
      variableDefinitions,
      variable,
      selectionSet,
      selections,
    } = node;


    const {
      classes,
    } = this.props;


    console.log("renderDefinition node", node);


    let output = [];

    const nameValue = name && name.value;
    const aliasValue = alias && alias.value;

    switch (kind) {


    }


    const childs = Object.values(node);

    // console.log("values", values);

    output.push(this.renderSuggestions(node));

    return <div
      key={[kind, nameValue, aliasValue].filter(n => n).join("_")}
      className={classes.node}
    >
      <Typography
        variant="headline"
        onClick={event => {

          event.stopPropagation();

          console.log("renderSuggestions node", node);
          console.log("renderSuggestions loc", loc);
        }}
      >
        Kind: {kind}. {nameValue ? `${nameValue} ${aliasValue ? ` (${aliasValue})` : ""}` : null}
      </Typography>


      {output}

      {this.renderChildDefinitions(childs)}

    </div>;
  }


  renderSuggestions(node) {

    const {
      schema,
      query,
    } = this.props;

    const {
      loc,
    } = node;

    if (!loc) {
      return null;
    }

    const {
      end,
      start,
    } = loc;


    // console.log("renderSuggestions node", node);
    // console.log("renderSuggestions loc", loc);

    // let suggestions = getAutocompleteSuggestions(schema, query, point);


    // console.log("renderSuggestions suggestions", node, loc, suggestions);

    // console.log("renderSuggestions suggestions start", getAutocompleteSuggestions(schema, query, loc));
    // console.log("renderSuggestions suggestions start", getAutocompleteSuggestions(schema, query, new Position(0, 0)));
    // console.log("renderSuggestions suggestions start", getAutocompleteSuggestions(schema, query, new Position(4, 2)));

    // console.log("renderSuggestions suggestions start", getAutocompleteSuggestions(schema, query, start));
    // console.log("renderSuggestions suggestions start + 1", getAutocompleteSuggestions(schema, query, start + 1));
    // console.log("renderSuggestions suggestions start - 1", getAutocompleteSuggestions(schema, query, start - 1));

    // console.log("renderSuggestions suggestions end", getAutocompleteSuggestions(schema, query, end));
    // console.log("renderSuggestions suggestions end + 1", getAutocompleteSuggestions(schema, query, end + 1));
    // console.log("renderSuggestions suggestions end - 1", getAutocompleteSuggestions(schema, query, end - 1));

  }


  renderChildDefinitions(values) {

    let output = [];

    values.map(n => {

      if (n) {

        if (n.kind) {
          output.push(this.renderDefinition(n));
        }
        else if (Array.isArray(n)) {
          output.push(this.renderChildDefinitions(n));
        }

      }

    });

    return output;

  }



  render() {

    const {
      classes,
      schema,
      query,
    } = this.props;


    const {
      point,
      parseError,
    } = this.state;


    let elements = this.renderDocumentFromSchema();



    return (
      <div
        className={classes.root}
      >

        {/* {this.test(query)} */}

        {/* <div>
          {this.renderEmptySchema(query)}
        </div> */}

        {parseError ? <div>
          <Typography
            color="error"
          >
            {parseError.toString()}
          </Typography>
          <details>
            {parseError.stack}
          </details>
        </div>
          : null}

        {elements}

      </div>
    );
  }
}


const UI = withStyles(styles)(QueryBuilderUI);

export default class ResultRenderer extends ResultViewer {


  shouldComponentUpdate(nextProps) {
    return true;
  }


  componentDidMount() {

    // Prevent parent styling
  }


  componentDidUpdate() {
  }

  componentWillUnmount() {
  }


  getCodeMirror() {
    return {
      setSize: (size) => {
      },
    }
  }

  render() {

    return (
      <div
        className="result-window"
        ref={node => {
          this._node = node;
        }}
      >
        <UI
          {...this.props}
        />
      </div>
    );
  }

}