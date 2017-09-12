
const emailMessage = codeParameter => eval('`'+require('./userConfirm.html')+'`')
const emailSubject = 'Welcome to App Starter 😎 !'

export class EmailConfirm {

  run = (event, done) => done(null, {
    ...event,
    response: {
      emailMessage: emailMessage(event.request.codeParameter),
      emailSubject
    }
  })

}

const emailConfirm =  new EmailConfirm()

export default (event, { done }) => emailConfirm.run(event, done)
