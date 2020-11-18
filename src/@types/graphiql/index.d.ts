
declare module 'graphiql' {
  import React, { PropsWithChildren } from 'react';
  import ResultRenderer from 'src/components/UI';

  export interface GraphiQLProps {
  }

  export interface GraphiQLState {
  }

  export default class GraphiQL<P extends GraphiQLProps = GraphiQLProps, S extends GraphiQLState = GraphiQLState>
    extends React.Component<P, S> {

    static Logo: any
    static Toolbar: any
    static Footer: any


    getQueryEditor: () => any;
    queryEditorComponent: QueryEditor

    docExplorerComponent: ExplorerComponent

    resultComponent: ResultRenderer

    variableEditorComponent: VariableEditor

    editorBarComponent: HTMLDivElement
    _storage: any;
    _editorQueryID: string

    handleToggleHistory: () => void;
    handleSelectHistoryQuery: () => void;


    handleRunQuery: () => void;
    handleStopQuery: () => void;
    handleToggleDocs: () => void;
    handleResetResize: () => void;
    handleResizeStart: () => void;
    handleClickReference: () => void;
    handleEditorRunQuery: () => void;
    handleVariableResizeStart: () => void;
    handleEditVariables: () => void;
    handleDocsResetResize: () => void;
    handleDocsResizeStart: () => void;
  }

  export class ExplorerComponent extends React.Component<PropsWithChildren>{
    showDoc: (type: GraphQLNamedType) => void;
  }

}
declare module 'graphiql/dist/components/ResultViewer' {
  import React from 'react';
  export class ResultViewer extends React.Component<React.PropsWithChildren> { }
}
declare module 'graphiql/dist/utility/debounce'
declare module 'graphiql/dist/utility/find'
declare module 'graphiql/dist/utility/getQueryFacts'
declare module 'graphiql/dist/utility/getSelectedOperationName'
declare module 'graphiql/dist/components/ExecuteButton'
declare module 'graphiql/dist/components/ToolbarButton'
declare module 'graphiql/dist/components/VariableEditor' {
  import React from 'react';
  export class VariableEditor extends React.Component<React.PropsWithChildren> { }
}
declare module 'graphiql/dist/components/QueryHistory'
declare module 'graphiql/dist/components/QueryEditor' {
  import React from 'react';
  export class QueryEditor extends React.Component<React.PropsWithChildren> { }
}
declare module 'graphiql/dist/components/DocExplorer'
