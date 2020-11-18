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

import React, { Component } from 'react'

import {
  ArgumentNode,
  DefinitionNode,
  DocumentNode,
  FieldNode,
  OperationDefinitionNode,
  parse,
  SelectionNode,
  StringValueNode,
  validate,
} from 'graphql'

import Typography from 'material-ui/Typography'
import Paper from 'material-ui/Paper'
import TextField from 'material-ui/TextField'

import { ResultViewer } from 'graphiql/dist/components/ResultViewer'

import { QueryBuilderUIProps, QueryBuilderUIState } from './interfaces'
import { QueryBuilderUIStyled } from './styles'
export * from './interfaces'

class QueryBuilderUI<
  P extends QueryBuilderUIProps = QueryBuilderUIProps,
  S extends QueryBuilderUIState = QueryBuilderUIState
> extends Component<P, S> {
  constructor(props: P) {
    super(props)

    const { query } = props

    this.state = {
      ...super.state,
      point: 0,
    }

    if (this.isValidQuery(query)) {
      Object.assign(this.state, {
        query,
      })
    }
  }

  isValidQuery(query: P['query']) {
    let parseError

    try {
      query && typeof query === 'string' && parse(query)
    } catch (error) {
      console.error('isValidQuery', error)

      parseError = error
    }

    Object.assign(this.state, {
      parseError,
    })

    return !parseError
  }

  UNSAFE_componentWillReceiveProps(nextProps: P) {
    const { query: nextQuery } = nextProps

    const { query } = this.props

    if (
      (nextQuery || query) &&
      nextQuery !== query &&
      this.isValidQuery(nextQuery)
    ) {
      this.setState({
        query: nextQuery,
      })
    }

    // super.UNSAFE_componentWillReceiveProps && super.UNSAFE_componentWillReceiveProps(nextProps, nextState);
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
    // const elements = [];

    const { schema } = this.props

    const { query } = this.state

    const AST = query && typeof query === 'string' ? parse(query) : null

    if (!AST) {
      return null
    }

    const errors = schema && AST ? validate(schema, AST) : []

    // let outputResults;

    // if (schema && AST) {

    //   errors = validate(schema, AST);

    //   // if (!errors.length) {

    //   //   outputResults = <ResultView
    //   //     query={query}
    //   //     // schema={schema}
    //   //     // AST={AST}
    //   //   />

    //   // }

    // }

    return (
      <div className="renderDocumentFromSchema">
        {errors && errors.length ? (
          <div className="errors">
            {errors.map((error, index) => (
              <Typography key={index} color="error">
                {error.toString()}
              </Typography>
            ))}
          </div>
        ) : null}

        {this.renderDefinition(AST)}
      </div>
    )
  }

  // Not used?
  // addVariable(currentState, variablesState) {

  //   const {
  //     token: {
  //       string,
  //     },
  //   } = currentState;

  //   const isStart = string === "$";

  //   let variableArray;

  //   const {
  //     variables,
  //     args,
  //   } = variablesState;

  //   if (isStart) {
  //     variableArray = [];
  //     variables.push(variableArray);
  //   }
  //   else {
  //     variableArray = variables[variables.length - 1];
  //   }

  //   variableArray.push(currentState);

  // }

  injectQuery(subQuery: string, line: number, col: number) {
    let { query } = this.props

    const lines = query ? query.split('\n') : []

    let editLine = lines[line]

    if (editLine !== undefined) {
      editLine = this.replaceRange(editLine, col, col, subQuery)

      lines[line] = editLine

      query = lines.join('\n')
    }

    return this.setQuery(query)
  }

  replaceRange(
    string: P['query'],
    start: number,
    end: number,
    substitute: string
  ) {
    return string
      ? string.substring(0, start) + substitute + string.substring(end)
      : ''
  }

  updateNode(node: StringValueNode, value: string) {
    const { loc, kind } = node

    if (!loc) {
      return
    }

    const { start, end, source } = loc

    const query = source?.body

    switch (kind as string) {
      case 'StringValue':
        value = `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

        break
    }

    const newQuery = this.replaceRange(query, start, end, value)

    this.setQuery(newQuery)
  }

  setQuery(query: P['query']) {
    const { setQuery } = this.props

    return setQuery(query)
  }

  renderDefinition(
    node:
      | DocumentNode
      | OperationDefinitionNode
      | FieldNode
      | SelectionNode
      | DefinitionNode
  ) {
    const output = []

    switch (node.kind) {
      case 'Document':
        output.push(this.renderDocument(node))

        break

      case 'OperationDefinition':
      case 'Field':
        output.push(this.renderOperationDefinition(node))

        break

      // TODO: render SelectionNode and others
    }

    return output
  }

  renderDocument(node: DocumentNode) {
    // let output;

    const { kind, definitions } = node

    return (
      <Paper key={kind} className={'paper document'}>
        Document
        <div>{this.renderDefinitions(definitions)}</div>
      </Paper>
    )
  }

  renderOperationDefinition(node: OperationDefinitionNode | FieldNode) {
    // let output;

    const {
      kind,
      // definitions,
      name,
      selectionSet,
      directives,
      // alias,
    } = node

    const { selections } = selectionSet || {}

    const nameValue = (name && name.value) || ''

    const aliasValue = node.kind === 'Field' ? node.alias?.value : ''

    const directivesList: React.ReactNode[] = []

    directives &&
      directives.map((n) => {
        const { arguments: args, name: directiveName } = n

        const directiveNameValue = (directiveName && directiveName.value) || ''

        directivesList.push(
          <div key={directiveNameValue} className={'block'}>
            DirectiveName: {directiveNameValue}
            {(args &&
              args.map((arg) => {
                const { name } = arg

                return <div key={name.value}>{this.renderArgument(arg)}</div>
              })) ||
              null}
          </div>
        )
      })

    return (
      <div
        key={`${kind}_${nameValue}_${aliasValue}`}
        className={['definition', kind].join(' ')}
      >
        <Typography variant="title">Kind: {kind}</Typography>
        <Typography variant="subheading">
          {nameValue} {aliasValue ? ` (${aliasValue})` : ''}
        </Typography>
        {directivesList}
        Selections:{' '}
        {(selections &&
          selections.map((n) => {
            return this.renderDefinition(n)
          })) ||
          null}
      </div>
    )
  }

  renderArgument(node: ArgumentNode) {
    let output

    const { value, name } = node

    // const {
    //   // kind: valueKind,
    //   name: valueName,
    //   value: valueValue,
    // } = value;

    switch (value.kind) {
      case 'Variable':
        output = (
          <Typography color="textSecondary">
            Variable: ${value.name.value}
          </Typography>
        )

        break

      case 'StringValue':
        output = (
          <TextField
            label={name.value}
            value={value.value || ''}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={(event) => this.onChangeArgument(event, value)}
          />
        )

        break
    }

    return output
  }

  onChangeArgument(
    event: React.ChangeEvent<HTMLInputElement>,
    node: StringValueNode
  ) {
    const { value } = event.target

    // const {
    //   loc: {

    //   },
    // } = node;

    return this.updateNode(node, value)
  }

  renderDefinitions(definitions: ReadonlyArray<DefinitionNode>) {
    return (
      (definitions &&
        definitions.map((definition) => this.renderDefinition(definition))) ||
      null
    )
  }

  // renderDefinition___(node: FieldNode) {

  //   const {
  //     kind,
  //     name,
  //     alias,
  //     // loc,
  //     // definitions,
  //     // operation,
  //     // directives,
  //     // variableDefinitions,
  //     // variable,
  //     // selectionSet,
  //     // selections,
  //   } = node;

  //   const output = [];

  //   const nameValue = name && name.value;
  //   const aliasValue = alias && alias.value;

  //   // switch (kind) {

  //   // }

  //   const childs: DefinitionNode[] = Object.values(node);

  //   // TODO Maybe restore
  //   // output.push(this.renderSuggestions(node));
  //   output.push(this.renderSuggestions());

  //   return <div
  //     key={[kind, nameValue, aliasValue].filter(n => n).join("_")}
  //     className={"node"}
  //   >
  //     <Typography
  //       variant="headline"
  //       // onClick={event => {

  //       //   event.stopPropagation();

  //       // }}
  //     >
  //       Kind: {kind}. {nameValue ? `${nameValue} ${aliasValue ? ` (${aliasValue})` : ""}` : null}
  //     </Typography>

  //     {output}

  //     {this.renderChildDefinitions(childs)}

  //   </div>;
  // }

  // TODO Maybe restore
  renderSuggestions() {
    // const {
    //   schema,
    //   query,
    // } = this.props;

    // const {
    //   loc,
    // } = node;

    // if (!loc) {
    //   return null;
    // }

    // const {
    //   end,
    //   start,
    // } = loc;

    return null
  }

  renderChildDefinitions(
    values: Array<DefinitionNode | DocumentNode | FieldNode>
  ) {
    const output: React.ReactNode[] = []

    values.map((n) => {
      if (n) {
        if (n.kind) {
          output.push(this.renderDefinition(n))
        } else if (Array.isArray(n)) {
          output.push(this.renderChildDefinitions(n))
        }
      }
    })

    return output
  }

  render() {
    const {
      // point,
      parseError,
    } = this.state

    const elements = this.renderDocumentFromSchema()

    return (
      <QueryBuilderUIStyled>
        {parseError ? (
          <div className="error">
            <Typography color="error">{parseError.toString()}</Typography>
            <details>{parseError.stack}</details>
          </div>
        ) : null}

        {elements}
      </QueryBuilderUIStyled>
    )
  }
}

// TODO Объединить все в один компонент
export default class ResultRenderer extends ResultViewer {
  // TODO Восстановить вывод результатов
  /**
   * Если реф определен, то сюда рендерится результат запросов.
   * Сейчас он перекрывает текущую панель просмотра. Надо ввести третью панель
   */
  // resultWindowRef = (node: HTMLDivElement) => {
  //   this._node = node
  // }

  render() {
    return (
      <div
        // TODO Восстановить вывод результатов
        // ref={this.resultWindowRef}
        className="result-window"
      >
        <QueryBuilderUI {...this.props} />
      </div>
    )
  }
}
