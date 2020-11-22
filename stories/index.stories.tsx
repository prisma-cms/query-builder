import '../src/styles/styles.scss'
import React, { useCallback, useMemo } from 'react'

import { Meta } from '@storybook/react'
import {
  Title,
  Subtitle,
  Description,
  Primary,
  ArgsTable,
  Stories,
  PRIMARY_STORY,
} from '@storybook/addon-docs/blocks'

import { default as Component, QueryBuilderProps } from '../src'
import gql from 'graphql-tag'
import { useApollo } from '../dev/lib/apolloClient'
import { buildClientSchema, GraphQLError, introspectionQuery } from 'graphql'
import { useQuery } from '@apollo/client'

const title = '@prisma-cms/query-builder'

const introspectionQueryDocument = gql(introspectionQuery)

export const QueryBuilder: React.FC = () => {
  // const { ...other } = props

  const client = useApollo(undefined)

  const fetcher = useCallback(
    async (props: Record<string, any>) => {
      try {
        const { query, ...other } = props
        // const { client } = this.props

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
    },
    [client]
  )

  // console.log("client", client);

  const schemaResult = useQuery(introspectionQueryDocument, {
    client,
    skip:
      typeof window === 'undefined' ||
      process.env.NODE_ENV === 'test' ||
      !!process.env.NODE,
  })

  const clientSchema = useMemo(() => {
    if (!schemaResult.data) {
      return null
    }
    return buildClientSchema(schemaResult.data)
  }, [schemaResult])

  if (schemaResult.error) {
    return <h3>{schemaResult.error.message}</h3>
  } else if (!clientSchema) {
    return <>Loading schema...</>
  }

  return (
    <>
      <Component fetcher={fetcher} schema={clientSchema} query="" />
    </>
  )
}

const args: Partial<QueryBuilderProps> = {}

export default {
  title,
  component: QueryBuilder,
  argTypes: {
    color: { control: 'color' },
    backgroundColor: { control: 'color' },
  },
  args,
  parameters: {
    docs: {
      page: () => (
        <>
          <Title>{title}</Title>
          <Subtitle></Subtitle>
          <Description></Description>
          <Primary></Primary>
          <ArgsTable story={PRIMARY_STORY} />
          <Stories />
        </>
      ),
    },
  },
} as Meta
