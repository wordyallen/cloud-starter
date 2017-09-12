
export default (e, c, cb) => cb(null, {
  statusCode: 200,
  headers: { 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify(e)
})