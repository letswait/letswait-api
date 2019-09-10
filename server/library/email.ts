import * as sendgrid from '@sendgrid/mail'
import sidewalk from './sidewalk'

sendgrid.setApiKey('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')
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