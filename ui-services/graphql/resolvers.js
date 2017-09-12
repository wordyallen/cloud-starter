import { DynamoDB, config } from 'aws-sdk'
import {generate} from 'shortid'
const { DocumentClient } = DynamoDB
const { ARTICLES_TABLE, COMMENTS_TABLE, NODE_ENV } = process.env
import {writeFileSync, readFileSync} from 'fs'
import {promisify} from 'util'

config.setPromisesDependency(Promise)

const dbConfig = TableName =>  NODE_ENV==='local'
  ? ({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      params: { TableName }
    })
  : ({params: { TableName }})



const ArticleDB = new DocumentClient(dbConfig(ARTICLES_TABLE))
const CommentDB = new DocumentClient(dbConfig(COMMENTS_TABLE))



export const querySingleArticle = async (context, { id }) =>{

  const {Item:article} = await ArticleDB.get({Key:{id}}).promise()

  const {Items:comments} = await CommentDB.query({
    ExpressionAttributeValues: { ':id': article.id },
    KeyConditionExpression: 'article_id = :id',
    ScanIdexForward: false,   //reverse sort, so most recent are first
    Limit: 50
  }).promise()

  return {...article, comments}

}


export const limitArticles = async (_, {limit})=>{

  let keyFromTmp
  try {keyFromTmp = JSON.parse(readFileSync('./key.json','utf8'))}
  catch (e) {}


  if(!keyFromTmp){

    const {Items:articles, LastEvaluatedKey} = await ArticleDB
      .scan({Limit:limit}).promise()

    writeFileSync('./key.json', JSON.stringify(LastEvaluatedKey), 'utf8' )

    return articles


  } else{
    
    const {Items:articles, LastEvaluatedKey} = await ArticleDB
      .scan({Limit:limit, ExclusiveStartKey: keyFromTmp})
      .promise()

    writeFileSync('./key.json', JSON.stringify(LastEvaluatedKey), 'utf8' )

    return articles

  }

}
  // if(!readFileSync('./key.json','utf8')){
  //   console.log('---no key in tmp')
  //
  //   const {Items:articles, LastEvaluatedKey} = await ArticleDB.scan({Limit:limit}).promise()
  //   writeFileSync('./key.json', JSON.stringify(LastEvaluatedKey), 'utf8' )
  //
  //   return articles
  //
  // } else{
  //
  //   console.log('---key IS in tmp!')
  //
  //   const keyFromTmp = JSON.parse(readFileSync('./key.json','utf8'))
  //   const {Items:articles, LastEvaluatedKey} = await ArticleDB.scan({
  //     Limit:limit,
  //     ExclusiveStartKey: keyFromTmp
  //   }).promise()
  //
  //   return articles
  // }


  // if(keyFromTmp && keyFromTmp.first){
  //
  //   const {Items:articles, LastEvaluatedKey} = await ArticleDB.scan({Limit:limit}).promise()
  //   writeFileSync('./key.json', JSON.stringify({next:LastEvaluatedKey}), 'utf8' )
  //
  //
  // }else if (keyFromTmp && keyFromTmp.next) {
  //
  //   const keyFromTmp = JSON.parse(readFileSync('./key.json', 'utf8' ))
  //   const {Items:articles, LastEvaluatedKey} = await ArticleDB.scan({
  //     Limit:limit
  //     ExclusiveStartKey: keyFromTmp.next
  //   }).promise()
  // } else {
  //
  // }














  // const {Items:articles, LastEvaluatedKey} =  await ArticleDB.scan({
  //           Limit: limit,
  //         }).promise()
  //
  // if(LastEvaluatedKey){
  //   return article
  // } else{
  //   const {Items:articles, LastEvaluatedKey} =  await ArticleDB.scan({
  //     Limit: limit,
  //     ExclusiveStartKey: LastEvaluatedKey,
  //   }).promise()
  //
  //   return articles
  // }
  //
  //
  // console.log(LastEvaluatedKey)
  // return articles

  // return articles


export const queryAllArticles = async (_, {hours, author_id}) =>{

  const {Items:articles, LastEvaluatedKey} = hours && author_id
    ? await ArticleDB.query({
        IndexName: 'author_x_posted',
        ExpressionAttributeValues:{
          ':a_id': author_id,
          ':earliest': Math.round(
            (Date.now()/1000) - (hours*3600)
          )
        },
        KeyConditionExpression: `
          author_id = :a_id and posted_at >= :earliest
        `,
      }).promise()
    : author_id
      ? await ArticleDB.query({
          IndexName: 'author_x_posted',
          ExpressionAttributeValues:{
            ':a': author_id
          },
          KeyConditionExpression: 'author_id = :a'
        }).promise()
      : await ArticleDB.scan({}).promise()



  return articles

}



export const putNewArticle = async ({claims}, {article:{link, title}}) => {

  const Item = {
    author_id: NODE_ENV==='local' ? 'anon' : claims['cognito:username'],
    posted_at: Math.round(Date.now() / 1000),
    id: generate(),
    link,
    title,
  }

  await ArticleDB.put({
    Item,
    Expected: { id: { Exists: false } }
  }).promise()

  return Item
}