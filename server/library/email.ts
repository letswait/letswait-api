import * as sendgrid from '@sendgrid/mail'
import sidewalk from './sidewalk'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY)
sidewalk.emphasize('Starting SendGrid Web API')

export function sendTemplate(options: {
  template: string,
  to: string,
  subject?: string,
  extraData?: any
}) {
  const { template, to, subject, extraData } = options
  const msg = {
    to,
    from: 'test@example.com',
    subject: subject || 'Sending with Twilio SendGrid is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };
  sendgrid.send(msg);
}

export function alertText(options: {
  to: string,
  body: string
}) {
  const msg = {
    to: options.to,
    from: 'test@example.com',
    subject: 'LET\'S WAIT ::: SERVER ALERT' ,
    text: options.body,
  };
  sendgrid.send(msg);
}
