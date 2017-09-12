const {SLS_STAGE} = process.env

export class AutoConfirm {

  run = (e, cb) => SLS_STAGE === 'dev'
    ? cb(null, {
      ...e, response: { autoConfirmUser: true }
    })
    : cb(null, e)
  
}


const autoConfirm = new AutoConfirm()

export default (e, context, cb) => autoConfirm.run(e, cb)