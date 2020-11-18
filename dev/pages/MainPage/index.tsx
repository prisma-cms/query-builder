import React, { Component, useMemo } from 'react'

import { buildClientSchema, GraphQLError, introspectionQuery } from 'graphql'

import gql from 'graphql-tag'
import QueryBuilder from 'src'
import { useQuery } from '@apollo/client'
import { MainPageProps, MainPageRenderProps } from './interfaces'
import { useApollo } from 'dev/lib/apolloClient'

const introspectionQueryDocument = gql(introspectionQuery)

class MainPage<P extends MainPageProps = MainPageProps> extends Component<P> {
  static defaultProps = {
    defaultQuery: ``,
  }

  fetcher = async (props: Record<string, any>) => {
    try {
      const { query, ...other } = props
      const { client } = this.props

      const result = await client
        .query({
          query: gql(query),
          ...other,
        })
        .catch((error: GraphQLError) => {
          console.error(error)
          throw error
        })

      return result
    } catch (error) {
      console.error('error', error)
    }
  }

  render() {
    const { query, clientSchema } = this.props

    if (!clientSchema) {
      return null
    }

    return (
      <QueryBuilder
        // defaultQuery={defaultQuery}
        query={query}
        schema={clientSchema}
        fetcher={this.fetcher}
      />
    )
  }
}

const MainPageRender: React.FC<MainPageRenderProps> = (props) => {
  const { query = '' } = props

  const client = useApollo(undefined)

  const result = useQuery(introspectionQueryDocument, {
    skip:
      typeof window === 'undefined' ||
      process.env.NODE_ENV === 'test' ||
      !!process.env.NODE,
  })

  const clientSchema = useMemo(() => {
    if (!result.data) {
      return null
    }
    return buildClientSchema(result.data)
  }, [result.data])

  if (!clientSchema || !client) {
    return null
  }

  return <MainPage clientSchema={clientSchema} client={client} query={query} />
}

export default MainPageRender
