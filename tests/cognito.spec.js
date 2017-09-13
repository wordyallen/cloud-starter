require('dotenv').config()
import {exec} from 'child_process'
import {
  CognitoUserPool as Pool,
  CognitoUserAttribute as Attribute,
  CognitoUser as User,
  AuthenticationDetails as Details,
} from 'amazon-cognito-identity-js'
import {LocalStorage} from 'node-localstorage'
import prompt from 'prompt'
import fetch from 'node-fetch'

const {NODE_ENV} = process.env
const localStorage = new LocalStorage('./tests')

const {UserPoolId, ClientId, API} = process.env

const u = {
  username: 'test8',
  password: 'password',
  newPassword: 'newPassword',
  email: 'test8@mailinator.com'
}

const poolData = {UserPoolId, ClientId}
const pool = new Pool(poolData)
const list =[new Attribute({Name:'email', Value: u.email})]
const user = new User({ Username: u.username, Pool: pool })


beforeAll(done =>
  pool.signUp(u.username, u.password, list, null, (err, res) => err
    ? (console.error(err), done())
    : (console.log('New User Created ⚡️ '), done())
  )
)




  NODE_ENV==='local'
  ? test('Confirm User ✅ ', done => {
        prompt.start()
        prompt.get(['code'], (err, { code }) => err
          ? (console.log(err), done())
          : user.confirmRegistration(code, true, (err, res) => err
            ? (console.log(err), done())
            : (expect(res).toEqual('SUCCESS', done() )
          )
        )
      )
    }, 60000)
  : test.skip()



describe('Standard Authentication Flow...', () => {

  test('Sign In and Get Token 🍪 ', () =>  new Promise((resolve, reject)=>
    user.authenticateUser(
      new Details({ Username: u.username, Password: u.password}), {
        onSuccess: res => resolve(res),
        onFailure: err => reject(err)
    }))
    .then(res => expect(res).toBeTruthy())
    .catch(err => expect(err).toBeFalsy())
  )




  test('Retrieve Current User from localStorage 🚶 ', done =>
    user.getSession( (err, session) => err
      ? (console.error(err), done())
      : (
          localStorage.setItem('token', session.getIdToken().getJwtToken()),
          expect(session.isValid()).toBeTruthy(),
          done()
        )
    )
  )

  test('Retrieve User Attributes 🚚  ', done =>
    user.getUserAttributes((err, res) => err
      ? (console.log(err), done())
      : (
        expect(res.filter(
          user => user.getValue() === u.email)
        ).toHaveLength(1),
        done()
      )
    )
  )



  test('Cognito Authorization against GraphQL API 🔐 ', ()=>
    fetch(`${API}/private`,{
      method: 'post',
      mode: 'cors',
      body: JSON.stringify({query:'{test}'}),
      headers: {
        'Accept': 'application/json',
        'Authorization': localStorage.getItem('token')
      }
    })
    .then( res => res.ok ? res.json() : Promise.reject(res.statusText))
    .then( queryResult =>
      expect(queryResult).toEqual({ data: { test: 'hi api user 👋🏼 ' } })
    )
    .catch( err => expect(err).toBeFalsy())
  )

})





describe('Misc: Changing password and Signing out...', () => {


  test('Change User Password 🤔 ', done =>
    user.changePassword(u.password, u.newPassword,
      (err, res) => err
        ? (console.error(err), done())
        : (expect(res).toEqual('SUCCESS'), done())
    )
  )

  test.skip('Sign User Out Globally 🌎 ', () => new Promise((resolve, reject) =>

    user.globalSignOut({
      onSuccess: res => resolve(res),
      onFailure: err => reject(err)
    }))
    .then(res => {
      // localStorage.removeItem('token')
      expect(res).toEqual('SUCCESS')
    })
    .catch(err => expect(err).toBeFalsy())
  )


})


afterAll(done => user.authenticateUser(
  new Details({ Username: u.username, Password: u.newPassword })
  , {
    onSuccess: result => user.deleteUser(
      (err, result) => err
        ? (console.error(err), done())
        : (console.log('User Deleted 👋🏼 '), done())
    ),
    onFailure: err => (console.error(err), done())
  })
)
