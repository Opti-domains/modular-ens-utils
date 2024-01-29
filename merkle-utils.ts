import crypto from 'crypto'

/**
utility function to remove a leading 0x on a string representing a hex number.
If no 0x is present then it returns the string un-altered.
*/
export function strip0x(hex: string) {
  if (typeof hex === 'undefined') return '';
  if (typeof hex === 'string' && hex.indexOf('0x') === 0) {
    return hex.slice(2).toString();
  }
  return hex.toString();
}

/**
utility function to check that a string is hexadecimal
*/
export function isHex(value: string) {
  if (typeof value !== 'string') return false;
  if (value.indexOf('0x') !== 0) return false;
  const regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(strip0x(value));
}

/** Helper function for the converting any base to any base
 */
export function convertBase(str: string, fromBase: number, toBase: number) {
  const digits = parseToDigitsArray(str, fromBase);
  if (digits === null) return null;

  let outArray: number[] = [];
  let power = [1];
  for (let i = 0; i < digits.length; i += 1) {
    // invariant: at this point, fromBase^i = power
    if (digits[i]) {
      outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
    }
    power = multiplyByNumber(fromBase, power, toBase);
  }

  let out = '';
  for (let i = outArray.length - 1; i >= 0; i -= 1) {
    out += outArray[i].toString(toBase);
  }
  // if the original input was equivalent to zero, then 'out' will still be empty ''. Let's check for zero.
  if (out === '') {
    let sum = 0;
    for (let i = 0; i < digits.length; i += 1) {
      sum += digits[i];
    }
    if (sum === 0) out = '0';
  }

  return out;
}

function parseToDigitsArray(str: string, base: number) {
  const digits = str.split('');
  const ary = [];
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    const n = parseInt(digits[i], base);
    if (Number.isNaN(n)) return null;
    ary.push(n);
  }
  return ary;
}

function add(x: any[], y: any[], base: number) {
  const z = [];
  const n = Math.max(x.length, y.length);
  let carry = 0;
  let i = 0;
  while (i < n || carry) {
    const xi = i < x.length ? x[i] : 0;
    const yi = i < y.length ? y[i] : 0;
    const zi = carry + xi + yi;
    z.push(zi % base);
    carry = Math.floor(zi / base);
    i += 1;
  }
  return z;
}

/** Helper function for the converting any base to any base
 Returns a*x, where x is an array of decimal digits and a is an ordinary
 JavaScript number. base is the number base of the array x.
 */
function multiplyByNumber(num: number, x: number[], base: number): number[] {
  if (num < 0) return [];
  if (num === 0) return [];

  let result: number[] = [];
  let power = x;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-bitwise
    if (num & 1) {
      result = add(result, power, base);
    }
    num >>= 1; // eslint-disable-line
    if (num === 0) break;
    power = add(power, power, base);
  }
  return result;
}

/**
Utility function to concatenate two hex strings and return as buffer
Looks like the inputs are somehow being changed to decimal!
*/
function concatenate(a: Buffer, b: Buffer) {
  const length = a.length + b.length;
  const buffer = Buffer.allocUnsafe(length); // creates a buffer object of length 'length'
  for (let i = 0; i < a.length; i += 1) {
    buffer[i] = a[i];
  }
  for (let j = 0; j < b.length; j += 1) {
    buffer[a.length + j] = b[j];
  }
  return buffer;
}

export function shaHash(...items: string[]) {
  const concatvalue = items
    .map(item => Buffer.from(strip0x(item), 'hex'))
    .reduce((acc, item) => concatenate(acc, item));

  // console.log(concatvalue.toString('hex'))

  const h = `0x${crypto
    .createHash('sha256')
    .update(concatvalue)
    .digest('hex')}`;
  return h;
}

export function concatenateThenHash(...items: string[]) {
  return shaHash(...items);
}
