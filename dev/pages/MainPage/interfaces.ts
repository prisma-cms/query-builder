import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { GraphQLSchema } from 'graphql'

export interface MainPageProps {
  client: ApolloClient<NormalizedCacheObject>

  clientSchema: GraphQLSchema

  defaultQuery: string

  query: string
}

export interface MainPageRenderProps {
  query: MainPageProps['query']
}
