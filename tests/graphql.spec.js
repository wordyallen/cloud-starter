require('dotenv').config()
import { LocalStorage } from 'node-localstorage'
const localStorage = new LocalStorage('./tests')
import fetch from 'node-fetch'
const { API } = process.env


test('Main GraphQL Endpoint is Available 🔌 ', ()=>
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
