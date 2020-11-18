import { GraphQLSchema } from 'graphql'

export interface QueryBuilderUIProps {
  query: string | undefined

  schema: GraphQLSchema

  setQuery: (query: string | undefined) => void
}

export interface QueryBuilderUIState {
  query: QueryBuilderUIProps['query']

  parseError: Error | null
}
