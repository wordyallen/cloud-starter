import { GraphQLString, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLInputObjectType } from 'graphql'
import { querySingleArticle, queryAllArticles, putNewArticle, limitArticles } from './resolvers'



const CommentType = new GraphQLObjectType({
  name: 'Comment',
  fields:{
    commenterID: {type: GraphQLString},
    article_id: {type: GraphQLString},
    posted_at: {type: GraphQLString},
    body: {type: GraphQLString},
  }
})


const ArticleType = new GraphQLObjectType({
  name: 'Article',
  fields:{
    id: {type: GraphQLString},
    author_id: {type: GraphQLString},
    score: {type: GraphQLInt},
    posted_at: {type: GraphQLInt},
    title: {type: GraphQLString},
    link: {type: GraphQLString},
    comments: {type: new GraphQLList(CommentType)},
  }
})


export const ArticleInputType = new GraphQLInputObjectType({
  name: 'NewArticle',
  fields: {
    link: { type: GraphQLString},
    title: {type: GraphQLString}
  }
})


export const article = {
  type: ArticleType,
  args:{id:{type: GraphQLString}} ,
  resolve: querySingleArticle,
}

export const articles ={
  type: new GraphQLList(ArticleType),
  args: {
    author_id: {type: GraphQLString},
    hours: {type: GraphQLInt}
  },
  resolve: queryAllArticles,
}

export const paginateArticles ={
  type: new GraphQLList(ArticleType),
  args: {
    limit:{type:GraphQLInt}
  },
  resolve: limitArticles,
}

export const createArticle = {
  type: ArticleType,
    args: {
    article: { type: ArticleInputType }
  },
  resolve: putNewArticle,
}
