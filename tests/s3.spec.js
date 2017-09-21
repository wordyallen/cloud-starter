require('dotenv').config()
import {config, S3, CognitoIdentityCredentials as CID} from 'aws-sdk'
import {writeFileSync, readFileSync} from 'fs'

const {region, IdentityPoolId, Bucket} = process.env


config.update({
  credentials: new CID({IdentityPoolId}),
  region
})

const s3 = new S3({params: {Bucket}})


test('List Albums in Bucket 📚 ', ()=>

  s3.listObjects({ Delimiter:'/', Prefix:'app-starter/'}).promise()
  .then( res =>
    expect(res).toHaveProperty('CommonPrefixes')
  )
  .catch( err => expect(err).toBeFalsy() )

)


test('Creating an Album in the Bucket 📝 ', ()=>

  s3.headObject({Key: 'app-starter/'}).promise()
  .then( res =>{
    expect(res).toHaveProperty('Metadata')
  }
  )
  .catch( err =>
      s3.putObject({
        Key: 'app-starter/'
      }).promise()
      .then( res =>
        expect(res).toHaveProperty('ETag')
      )
      .catch( err => expect(err).toBeFalsy() )
  )

)





test('Viewing an Album 👀 ', async ()=>{

  const req =  s3.listObjects({ Prefix:'app-starter/album1/'})

  return req.on('build', ()=>{
    console.log( `${req.httpRequest.endpoint.href}` )
    expect(req.httpRequest.endpoint.href).toBeTruthy()
  }).promise()


})


test('Adding Photos to an Album 📸 ', ()=>{

  const Body = readFileSync('./tests/1000.png', )
  const Key = 'app-starter/album1/1000.png'

  s3.upload({
    Key,
    Body,
    ACL: 'public-read',
  }).promise()
  .then( res =>
    expect(res).toHaveProperty('ETag')
  )
  .catch( err =>
    expect(err.message).toBeFalsy()
  )

})


test.skip('Deleting A Photo 🙅🏽 ', ()=>

  s3.deleteObject({ Key:'app-starter/album1/1000.png'})
  .promise()
  .then( res  =>expect(res).toBeTruthy())
  .catch( err => expect(err).toBeFalsy())

)

// https://github.com/aws/aws-sdk-js/issues/1255
test.skip('Deleting An Album ❌ ', ()=>

  s3.listObjects({Prefix:'app-starter/album1/'})
    .promise()
    .then( ({Contents}) => Contents.map( ({Key}) => ({Key}) ) )
    .then( Objects =>
      s3.deleteObjects({
      Delete: {Objects} }).promise()
    )
    .then(res =>console.log(res))
    .catch(err => expect(err).toBeFalsy() )

)
