import { DynamoDB, config } from 'aws-sdk'
import {generate} from 'shortid'
const { DocumentClient } = DynamoDB
const { ARTICLES_TABLE, COMMENTS_TABLE, NODE_ENV } = process.env
const dbConfig = TableName =>  NODE_ENV==='local'
  ? ({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
      params: { TableName }
    })
  : ({params: { TableName }})



const ArticleDB = new DocumentClient(dbConfig(ARTICLES_TABLE))



export default async ( {Records}, c, cb) => {

  const key = Records.map( ({s3:{object:{key}}}) =>key  )[0]


  const {Item:article} = await ArticleDB.get({Key:{id:"rJtzIyc9b"}}).promise()


  const updatedItem = {...article, preview: `https://s3.amazonaws.com/dev-app-starter-photos/${key}`  }

  await ArticleDB.put({
    Item: updatedItem,
  }).promise()


}
