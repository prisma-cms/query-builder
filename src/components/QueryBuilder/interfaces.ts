import { ApolloQueryResult } from '@apollo/client'
import { GraphQLSchema } from 'graphql'

export interface QueryBuilderProps extends Record<string, any> {
  fetcher: (
    props: Record<string, any>
  ) => Promise<ApolloQueryResult<Record<string, any>> | undefined>
  schema: GraphQLSchema
  query: string
  onEditQuery?: (value: string | undefined) => void
  onEditOperationName?: (value: string | undefined) => void
  editorTheme?: any
  ResultsTooltip?: any
  view?: any
}

export interface QueryBuilderState extends Record<string, any> {
  operationName: string
  operations: any[]
  schema: GraphQLSchema
  query: string
  docExplorerOpen: boolean

  editorFlex: any

  docExplorerWidth: number

  historyPaneOpen: boolean

  variableEditorOpen: boolean

  variableEditorHeight: number

  variables: Record<string, any>
  subscription: boolean
  variableToType: any
  isWaitingForResponse: boolean
  response: any
}
