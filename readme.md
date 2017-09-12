# Todo
### mock client (DONT GET BLOCKED OUT)
  - [x] Send an html email
  - [x] Write a test suite for all of cognito
    - [ ] Finish writing confirm user test

#### clientless api
  - [ ] update web-starter to deploy to s3 and get that info to the backend

#### socket solution

```js
import {device} from 'aws-iot-device-sdk'
import { MQTTPubSub } from 'graphql-mqtt-subscriptions'

const client = device({
   keyPath: <YourPrivateKeyPath>,
  certPath: <YourCertificatePath>,
    caPath: <YourRootCACertificatePath>,
  clientId: <YourUniqueClientIdentifier>,
      host: <YourCustomEndpoint>
})

//this is the critical part
const pubsub = new MQTTPubSub({client})

export const resolvers = {
  Subscription: {
    somethingChanged: {
      subscribe: () => pubsub.asyncIterator(‘messageAdded’),
    },
  },
}


// schema.js
`type Subscription {
  messageAdded(channelId: ID!): Message
}`












```
# cloud-starter
