require('dotenv').config()
const {config, S3, CognitoIdentityCredentials:CID} =  require('aws-sdk')
const {region, IdentityPoolId, Bucket} = process.env


{
   "Version": "2012-10-17",
   "Statement": [
      {
         "Effect": "Allow",
         "Action": [
            "s3:*"
         ],
         "Principal": "*",
         "Resource": [
            "arn:aws:s3:::dev-app-starter-photos/*"
         ]
      }
   ]
}


config.update({
  credentials: new CID({IdentityPoolId}),
  region
})

const s3 = new S3({params: {Bucket}})


//empty bucket
s3.listObjects({Prefix:'app-starter/album1/'})
  .promise()
  .then( ({Contents}) => Contents.map( ({Key}) => ({Key}) ) )
  .then( Objects =>
    s3.deleteObjects({
    Delete: {Objects} }).promise()
  )
  .then(res =>console.log(res))
  .catch(({message}) =>  console.error(message) )
