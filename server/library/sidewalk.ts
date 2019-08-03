import Chalk from 'chalk'

function success(message: string, ...otherParams: any[]) {
  console.log(Chalk.green(`✓ ${message} ✓`), otherParams.toString())
}
function warning(message: string, ...otherParams: any[]) {
  console.log(Chalk.yellow(`${message}...`), otherParams.toString())
}
function error(message: string, logStackTrace?: boolean, ...otherParams: any[]) {
  let log: any = Chalk.red(`ERROR: ${arguments[0]}`)
  if(logStackTrace) {
    log = new Error(log)
  }
  console.log(log, otherParams.toString())
}
function emphasize(message: string, ...otherParams: any[]) {
  console.log(Chalk.cyan.underline(`ALERT: ${message}`), otherParams.toString())
}
function detour(message: string, ...otherParams: any[]) {
  console.log(Chalk.magenta(`${message}`), otherParams.toString())
}

const sidewalk = {
  error,
  warning,
  success,
  emphasize,
  detour,
}
export default sidewalk
