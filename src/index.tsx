import React from 'react'

// import withStyles from 'material-ui/styles/withStyles'

import { GraphQLSchema, parse, print } from 'graphql'

// import 'graphiql/graphiql.css'

import GraphiQL, { ExplorerComponent } from 'graphiql'

import debounce from 'graphiql/dist/utility/debounce'
import find from 'graphiql/dist/utility/find'
import getQueryFacts from 'graphiql/dist/utility/getQueryFacts'
import getSelectedOperationName from 'graphiql/dist/utility/getSelectedOperationName'
import { ExecuteButton } from 'graphiql/dist/components/ExecuteButton'
import { ToolbarButton } from 'graphiql/dist/components/ToolbarButton'
import { VariableEditor } from 'graphiql/dist/components/VariableEditor'
// import { ResultViewer } from 'graphiql/dist/components/ResultViewer';
import { QueryHistory } from 'graphiql/dist/components/QueryHistory'

import { QueryEditor } from 'graphiql/dist/components/QueryEditor'
// import QueryEditor from "./QueryEditor";

import { DocExplorer } from 'graphiql/dist/components/DocExplorer'
// import DocExplorer from "./DocExplorer";

// import Button from 'material-ui/Button';

import { getAutocompleteSuggestions } from 'graphql-language-service-interface'

import QueryBuilderUI from './components/UI'
import { QueryBuilderStyled } from './styles'
import { QueryBuilderProps, QueryBuilderState } from './interfaces'
// import ResultRenderer from './components/UI'

export * from './interfaces'

// const styles = {

//   root: {
//     height: "100%",
//     display: "flex",
//     flexDirection: "column",
//     width: "100%",

//     "& .graphiql-container .topBar, & .graphiql-container .doc-explorer-title-bar, & .graphiql-container .history-title-bar": {
//       height: 48,
//     },

//     "& .graphiql-container .doc-explorer-title, .graphiql-container .history-title": {
//       userSelect: "all",
//     },
//   },

// }

class QueryBuilder<
  P extends QueryBuilderProps = QueryBuilderProps,
  S extends QueryBuilderState = QueryBuilderState
> extends GraphiQL<P, S> {
  // static propTypes = {
  //   ...GraphiQL.propTypes,
  //   schema: PropTypes.object.isRequired,
  // };

  handleEditQuery = debounce(
    100,
    (value: string | undefined, callback: () => void) => {
      // console.log('handleEditQuery', value)

      const { onEditQuery } = this.props

      const { operationName, operations, schema } = this.state

      let queryFacts

      try {
        queryFacts = this._updateQueryFacts(
          value,
          operationName,
          operations,
          schema
        )

        // console.log('handleEditQuery queryFacts', queryFacts)
      } catch (error) {
        console.error(error)
      }

      this.setState(
        {
          query: value,
          ...queryFacts,
        },
        callback
      )

      if (onEditQuery) {
        try {
          onEditQuery(value)
        } catch (error) {
          console.error(error)
        }
      }
    }
  )

  _updateQueryFacts = (
    query: string | undefined,
    operationName: string,
    prevOperations: any,
    schema: GraphQLSchema
  ) => {
    const queryFacts = getQueryFacts(schema, query)

    if (queryFacts) {
      // Update operation name should any query names change.
      const updatedOperationName = getSelectedOperationName(
        prevOperations,
        operationName,
        queryFacts.operations
      )

      // Report changing of operationName if it changed.
      const onEditOperationName = this.props.onEditOperationName
      if (onEditOperationName && operationName !== updatedOperationName) {
        onEditOperationName(updatedOperationName)
      }

      return {
        operationName: updatedOperationName,
        ...queryFacts,
      }
    }
  }

  addQuery(newQuery: string | undefined) {
    const { query } = this.state

    newQuery = `
      ${query}

      ${newQuery}

    `
    return this.setQuery(newQuery)
  }

  setQuery = (query: string | undefined) => {
    try {
      this.handleEditQuery(query, () => this.handlePrettifyQuery())
    } catch (error) {
      // console.error(error);
      // throw error;
    }
  }

  handlePrettifyQuery = () => {
    try {
      const editor = this.getQueryEditor()
      editor.setValue(print(parse(editor.getValue())))
    } catch (error) {
      // console.error(error);
    }
  }

  handleHintInformationRender = (elem: any) => {
    const { editor } = this.queryEditorComponent

    const { schema } = this.state

    if (!schema) {
      return
    }

    const cur = editor.getCursor()
    const token = editor.getTokenAt(cur)
    const rawResults: any[] = getAutocompleteSuggestions(
      schema,
      editor.getValue(),
      cur,
      token
    )
    /**
     * GraphQL language service responds to the autocompletion request with
     * a different format:
     * type CompletionItem = {
     *   label: string,
     *   kind?: number,
     *   detail?: string,
     *   documentation?: string,
     *   // GraphQL Deprecation information
     *   isDeprecated?: ?string,
     *   deprecationReason?: ?string,
     * };
     *
     * Switch to codemirror-compliant format before returning results.
     */
    const tokenStart =
      token.type !== null && /"|\w/.test(token.string[0])
        ? token.start
        : token.end
    const results = {
      list: rawResults.map((item) => ({
        text: item.label,
        type: schema.getType(item.detail),
        description: item.documentation,
        isDeprecated: item.isDeprecated,
        deprecationReason: item.deprecationReason,
      })),
      from: { line: cur.line, column: tokenStart },
      to: { line: cur.line, column: token.end },
    }

    if (results && results.list && results.list.length > 0) {
      // results.from = CodeMirror.Pos(results.from.line, results.from.column);
      // results.to = CodeMirror.Pos(results.to.line, results.to.column);
      // CodeMirror.signal(editor, 'hasCompletion', editor, results, token);
    }

    elem.addEventListener('click', this._onClickHintInformation)

    let onRemoveFn: () => void | undefined

    elem.addEventListener(
      'DOMNodeRemoved',
      (onRemoveFn = () => {
        elem.removeEventListener('DOMNodeRemoved', onRemoveFn)
        elem.removeEventListener('click', this._onClickHintInformation)
      })
    )
  }

  _onClickHintInformation = (event: any) => {
    if (event.target.className === 'typeName') {
      const typeName = event.target.innerHTML
      const schema = this.state.schema
      if (schema) {
        const type = schema.getType(typeName)
        if (type) {
          this.setState({ docExplorerOpen: true }, () => {
            this.docExplorerComponent.showDoc(type)
          })
        }
      }
    }
  }

  // handleEditorRunQuery = () => {
  //   this._runQueryAtCursor();
  // };

  docExplorerRef = (c: ExplorerComponent) => {
    this.docExplorerComponent = c
  }

  queryBuilderUiRef = (c: QueryBuilderUI) => {
    this.resultComponent = c
  }

  variableEditorComponentRef = (n: VariableEditor) => {
    this.variableEditorComponent = n
  }
  queryEditorComponentRef = (n: QueryEditor) => {
    this.queryEditorComponent = n
  }

  editorBarComponentRef = (n: HTMLDivElement) => {
    this.editorBarComponent = n
  }

  _render() {
    const { view } = this.props

    const { query, schema } = this.state

    const children = React.Children.toArray(this.props.children)

    const logo = find(
      children,
      (child: any) => child.type === GraphiQL.Logo
    ) || <GraphiQL.Logo />

    const toolbar = find(
      children,
      (child: any) => child.type === GraphiQL.Toolbar
    ) || (
      <GraphiQL.Toolbar>
        <ToolbarButton
          onClick={this.handlePrettifyQuery}
          title="Prettify Query (Shift-Ctrl-P)"
          label="Prettify"
        />
        <ToolbarButton
          onClick={this.handleToggleHistory}
          title="Show History"
          label="History"
        />
      </GraphiQL.Toolbar>
    )

    const footer = find(
      children,
      (child: any) => child.type === GraphiQL.Footer
    )

    const queryWrapStyle = {
      WebkitFlex: this.state.editorFlex,
      flex: this.state.editorFlex,
    }

    const docWrapStyle = {
      display: this.state.docExplorerOpen ? 'block' : 'none',
      width: this.state.docExplorerWidth,
    }
    const docExplorerWrapClasses =
      'docExplorerWrap' +
      (this.state.docExplorerWidth < 200 ? ' doc-explorer-narrow' : '')

    const historyPaneStyle = {
      display: this.state.historyPaneOpen ? 'block' : 'none',
      width: '230px',
      zIndex: 7,
    }

    const variableOpen = this.state.variableEditorOpen
    const variableStyle = {
      height: variableOpen ? this.state.variableEditorHeight : undefined,
    }

    return (
      <div className="graphiql-container">
        <div className="historyPaneWrap" style={historyPaneStyle}>
          <QueryHistory
            operationName={this.state.operationName}
            query={this.state.query}
            variables={this.state.variables}
            onSelectQuery={this.handleSelectHistoryQuery}
            storage={this._storage}
            queryID={this._editorQueryID}
          >
            <div className="docExplorerHide" onClick={this.handleToggleHistory}>
              {'\u2715'}
            </div>
          </QueryHistory>
        </div>
        <div className="editorWrap">
          <div className="topBarWrap">
            <div className="topBar">
              {logo}
              <ExecuteButton
                isRunning={Boolean(this.state.subscription)}
                onRun={this.handleRunQuery}
                onStop={this.handleStopQuery}
                operations={this.state.operations}
              />
              {toolbar}
            </div>
            {!this.state.docExplorerOpen && (
              <button
                className="docExplorerShow"
                onClick={this.handleToggleDocs}
              >
                {'Docs'}
              </button>
            )}
          </div>
          <div
            ref={this.editorBarComponentRef}
            className="editorBar"
            onDoubleClick={this.handleResetResize}
            onMouseDown={this.handleResizeStart}
          >
            <div className="queryWrap" style={queryWrapStyle}>
              <QueryEditor
                ref={this.queryEditorComponentRef}
                schema={this.state.schema}
                value={this.state.query}
                onEdit={this.handleEditQuery}
                onHintInformationRender={this.handleHintInformationRender}
                onClickReference={this.handleClickReference}
                onPrettifyQuery={this.handlePrettifyQuery}
                onRunQuery={this.handleEditorRunQuery}
                editorTheme={this.props.editorTheme}
              />
              <div className="variable-editor" style={variableStyle}>
                <div
                  className="variable-editor-title"
                  style={{ cursor: variableOpen ? 'row-resize' : 'n-resize' }}
                  onMouseDown={this.handleVariableResizeStart}
                >
                  {'Query Variables'}
                </div>
                <VariableEditor
                  ref={this.variableEditorComponentRef}
                  value={this.state.variables}
                  variableToType={this.state.variableToType}
                  onEdit={this.handleEditVariables}
                  onHintInformationRender={this.handleHintInformationRender}
                  onPrettifyQuery={this.handlePrettifyQuery}
                  onRunQuery={this.handleEditorRunQuery}
                  editorTheme={this.props.editorTheme}
                />
              </div>
            </div>
            <div className="resultWrap">
              {this.state.isWaitingForResponse && (
                <div className="spinner-container">
                  <div className="spinner" />
                </div>
              )}
              <QueryBuilderUI
                ref={this.queryBuilderUiRef}
                value={this.state.response}
                editorTheme={this.props.editorTheme}
                ResultsTooltip={this.props.ResultsTooltip}
                schema={schema}
                query={query}
                setQuery={this.setQuery}
                view={view}
              />
              {footer}
            </div>
          </div>
        </div>
        <div className={docExplorerWrapClasses} style={docWrapStyle}>
          <div
            className="docExplorerResizer"
            onDoubleClick={this.handleDocsResetResize}
            onMouseDown={this.handleDocsResizeStart}
          />
          <DocExplorer
            ref={this.docExplorerRef}
            schema={schema}
            query={query}
            setQuery={this.setQuery}
          >
            <div className="docExplorerHide" onClick={this.handleToggleDocs}>
              {'\u2715'}
            </div>
          </DocExplorer>
        </div>
      </div>
    )
  }

  render() {
    // const {
    //   classes,
    // } = this.props;

    return (
      <QueryBuilderStyled
      // className={classes.root}
      >
        {this._render()}
      </QueryBuilderStyled>
    )
  }
}

export default QueryBuilder

// export default withStyles(styles)(props => <QueryBuilder
//   {...props}
// />);
