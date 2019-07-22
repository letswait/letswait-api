
/**
 * @function genRandomNumbers
 * @description - Generates random string of numbers
 * @param n - digits in output string
 */
export const genRandomNumbers = (n: number = 4): string => {
  const numArr = new Array(n).fill(0).map(() => Math.floor(Math.random()*10))
  return numArr.join('')
}
