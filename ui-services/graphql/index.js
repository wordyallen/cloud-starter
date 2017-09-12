import {GraphQLSchema, GraphQLObjectType, GraphQLString, graphql} from 'graphql'
import { article, articles, createArticle, paginateArticles} from './types'
const {NODE_ENV}= process.env


export class GraphQL {

  rootMutation = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {createArticle}
  })

  rootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      test:{ type: GraphQLString, resolve: () => 'hi api user 👋🏼 '},
      articles,
      article,
      paginateArticles,
    }
  })

  privateSchema = new GraphQLSchema({
    mutation: this.rootMutation,
    query: this.rootQuery
  })

  publicSchema = new GraphQLSchema({query: this.rootQuery})

  run = async (body, requestContext, cb) => {

    const { query, variables } = JSON.parse(body)


    const {claims} = requestContext.authorizer ? requestContext.authorizer:''

    let schema
    claims || NODE_ENV ==='local'
      ? schema = this.privateSchema
      : schema = this.publicSchema

    const resolution = await graphql(schema, query, {claims}, null, variables)

    return cb(null, {
      statusCode: 200,
      body: JSON.stringify(resolution),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json; charset=UTF-8'
      },
    })

  }
}

const graphQL = new GraphQL()

export default ({body, requestContext}, c, cb) =>
  graphQL.run(body, requestContext, cb)
