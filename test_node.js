// ---- Replicate calculator internals exactly ----
let angleMode = 'DEG';

function toRadians(angle) {
  return angleMode === 'DEG' ? angle * Math.PI / 180 : angle;
}
function fromRadians(rad) {
  return angleMode === 'DEG' ? rad * 180 / Math.PI : rad;
}

function factorial(n) {
  n = Math.round(n);
  if (n < 0) return 'Error';
  if (n > 170) return Infinity;
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function formatNumber(num) {
  if (num === 'Error') return 'Error';
  if (typeof num === 'string') num = parseFloat(num);
  if (typeof num !== 'number' || isNaN(num)) return 'Error';
  if (!isFinite(num)) return num > 0 ? 'Inf' : '-Inf';
  if (Math.abs(num) < 1e-14) return '0';
  if (Math.abs(num) > 999999999999) return num.toExponential(5);
  if (Math.abs(num) < 0.000001 && num !== 0) return num.toExponential(5);
  return parseFloat(num.toPrecision(12)).toString();
}

function handleFunction(func, currentValue) {
  const num = parseFloat(currentValue);
  if (isNaN(num)) return { result: 'Error', expression: '' };
  let result;
  let expression = '';

  switch (func) {
    case 'sin': {
      const rad = toRadians(num);
      result = Math.sin(rad);
      break;
    }
    case 'cos': {
      const rad = toRadians(num);
      result = Math.cos(rad);
      break;
    }
    case 'tan': {
      if (angleMode === 'DEG' && Math.abs(num % 180) === 90) {
        result = 'Error';
      } else if (angleMode === 'RAD' && Math.abs((num / (Math.PI / 2)) % 2 - 1) < 1e-10) {
        result = 'Error';
      } else {
        const rad = toRadians(num);
        result = Math.tan(rad);
      }
      break;
    }
    case 'asin': {
      if (num < -1 || num > 1) { result = 'Error'; }
      else { result = fromRadians(Math.asin(num)); }
      break;
    }
    case 'acos': {
      if (num < -1 || num > 1) { result = 'Error'; }
      else { result = fromRadians(Math.acos(num)); }
      break;
    }
    case 'atan': {
      result = fromRadians(Math.atan(num));
      break;
    }
    case 'log': {
      if (num <= 0) { result = 'Error'; }
      else { result = Math.log10(num); }
      break;
    }
    case 'ln': {
      if (num <= 0) { result = 'Error'; }
      else { result = Math.log(num); }
      break;
    }
    case 'sqrt': {
      if (num < 0) { result = 'Error'; }
      else { result = Math.sqrt(num); }
      break;
    }
    case 'square': {
      result = num * num;
      break;
    }
    case 'cube': {
      result = num * num * num;
      break;
    }
    case 'cbrt': {
      result = Math.cbrt(num);
      break;
    }
    case '10^x': {
      result = Math.pow(10, num);
      break;
    }
    case 'factorial': {
      if (num < 0 || !Number.isInteger(num)) { result = 'Error'; }
      else if (num > 170) { result = Infinity; }
      else { result = factorial(num); }
      break;
    }
    case 'inv': {
      if (num === 0) { result = 'Error'; }
      else { result = 1 / num; }
      break;
    }
    case 'abs': {
      result = Math.abs(num);
      break;
    }
    case 'negate': {
      result = -num;
      break;
    }
    default:
      return { result: String(num), expression: '' };
  }
  return { result: formatNumber(result), expression };
}

function calculate(a, op, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  if (isNaN(numA) || isNaN(numB)) return 'Error';
  switch (op) {
    case '+': return numA + numB;
    case '-': return numA - numB;
    case '*': return numA * numB;
    case '/': return numB === 0 ? 'Error' : numA / numB;
    case '^': return Math.pow(numA, numB);
    default: return numB;
  }
}

// ---- Test Runner ----
let passed = 0, failed = 0, tests = [];

function test(name, actual, expected) {
  const ok = actual === expected;
  if (ok) {
    passed++;
  } else {
    failed++;
    tests.push({ name, actual, expected });
  }
}

function section(title) {
  // just a marker
}

// ============================
// TEST SUITE
// ============================

// ---- TRIG (DEG MODE) ----
angleMode = 'DEG';
test('sin(0) = 0',     handleFunction('sin', '0').result, '0');
test('sin(30) = 0.5',  handleFunction('sin', '30').result, '0.5');
test('sin(90) = 1',    handleFunction('sin', '90').result, '1');
test('sin(180) = 0',   handleFunction('sin', '180').result, '0');
test('sin(270) = -1',  handleFunction('sin', '270').result, '-1');
test('sin(360) = 0',   handleFunction('sin', '360').result, '0');

test('cos(0) = 1',     handleFunction('cos', '0').result, '1');
test('cos(60) = 0.5',  handleFunction('cos', '60').result, '0.5');
test('cos(90) = 0',    handleFunction('cos', '90').result, '0');
test('cos(180) = -1',  handleFunction('cos', '180').result, '-1');
test('cos(360) = 1',   handleFunction('cos', '360').result, '1');

test('tan(0) = 0',     handleFunction('tan', '0').result, '0');
test('tan(45) = 1',    handleFunction('tan', '45').result, '1');
test('tan(90) = Error', handleFunction('tan', '90').result, 'Error');
test('tan(180) = 0',   handleFunction('tan', '180').result, '0');
test('tan(270) = Error', handleFunction('tan', '270').result, 'Error');
test('tan(-90) = Error', handleFunction('tan', '-90').result, 'Error');

// ---- TRIG (RAD MODE) ----
angleMode = 'RAD';
test('sin(0) RAD = 0',  handleFunction('sin', '0').result, '0');
test('sin(PI/6) = 0.5', handleFunction('sin', String(Math.PI / 6)).result, '0.5');
test('sin(PI/2) = 1',   handleFunction('sin', String(Math.PI / 2)).result, '1');
test('cos(0) RAD = 1',  handleFunction('cos', '0').result, '1');
test('cos(PI/3) = 0.5', handleFunction('cos', String(Math.PI / 3)).result, '0.5');
test('cos(PI) = -1',    handleFunction('cos', String(Math.PI)).result, '-1');
test('tan(0) RAD = 0',  handleFunction('tan', '0').result, '0');
test('tan(PI/4) = 1',   handleFunction('tan', String(Math.PI / 4)).result, '1');

// ---- INVERSE TRIG (DEG) ----
angleMode = 'DEG';
test('asin(0) = 0',     handleFunction('asin', '0').result, '0');
test('asin(0.5) = 30',  handleFunction('asin', '0.5').result, '30');
test('asin(1) = 90',    handleFunction('asin', '1').result, '90');
test('asin(-1) = -90',  handleFunction('asin', '-1').result, '-90');
test('asin(2) = Error', handleFunction('asin', '2').result, 'Error');
test('acos(1) = 0',     handleFunction('acos', '1').result, '0');
test('acos(0.5) = 60',  handleFunction('acos', '0.5').result, '60');
test('acos(0) = 90',    handleFunction('acos', '0').result, '90');
test('acos(-1) = 180',  handleFunction('acos', '-1').result, '180');
test('atan(0) = 0',     handleFunction('atan', '0').result, '0');
test('atan(1) = 45',    handleFunction('atan', '1').result, '45');
test('atan(-1) = -45',  handleFunction('atan', '-1').result, '-45');

// ---- LOGARITHMS ----
test('log(1) = 0',      handleFunction('log', '1').result, '0');
test('log(10) = 1',     handleFunction('log', '10').result, '1');
test('log(100) = 2',    handleFunction('log', '100').result, '2');
test('log(1000) = 3',   handleFunction('log', '1000').result, '3');
test('log(0) = Error',  handleFunction('log', '0').result, 'Error');
test('log(-5) = Error', handleFunction('log', '-5').result, 'Error');
test('log(0.1) = -1',   handleFunction('log', '0.1').result, '-1');

test('ln(1) = 0',       handleFunction('ln', '1').result, '0');
test('ln(e) = 1',       handleFunction('ln', String(Math.E)).result, '1');
test('ln(0) = Error',   handleFunction('ln', '0').result, 'Error');

// ---- POWER / ROOTS ----
test('sqrt(0) = 0',     handleFunction('sqrt', '0').result, '0');
test('sqrt(4) = 2',     handleFunction('sqrt', '4').result, '2');
test('sqrt(9) = 3',     handleFunction('sqrt', '9').result, '3');
test('sqrt(-1) = Error', handleFunction('sqrt', '-1').result, 'Error');

test('2^2 = 4',         handleFunction('square', '2').result, '4');
test('(-3)^2 = 9',      handleFunction('square', '-3').result, '9');

test('10^0 = 1',        handleFunction('10^x', '0').result, '1');
test('10^2 = 100',      handleFunction('10^x', '2').result, '100');
test('10^-1 = 0.1',     handleFunction('10^x', '-1').result, '0.1');

// ---- FACTORIAL ----
test('0! = 1',          handleFunction('factorial', '0').result, '1');
test('5! = 120',        handleFunction('factorial', '5').result, '120');
test('10! = 3628800',   handleFunction('factorial', '10').result, '3628800');
test('(-1)! = Error',   handleFunction('factorial', '-1').result, 'Error');
test('2.5! = Error',    handleFunction('factorial', '2.5').result, 'Error');
test('171! = Inf',      handleFunction('factorial', '171').result, 'Inf');

// ---- OTHER ----
test('1/2 = 0.5',       handleFunction('inv', '2').result, '0.5');
test('1/0 = Error',     handleFunction('inv', '0').result, 'Error');
test('|5| = 5',         handleFunction('abs', '5').result, '5');
test('|-5| = 5',        handleFunction('abs', '-5').result, '5');
test('negate(5) = -5',  handleFunction('negate', '5').result, '-5');
test('negate(-3) = 3',  handleFunction('negate', '-3').result, '3');
test('negate(0) = 0',   handleFunction('negate', '0').result, '0');

// ---- BASIC ARITHMETIC ----
test('2+3 = 5',         formatNumber(calculate('2', '+', '3')), '5');
test('10-4 = 6',        formatNumber(calculate('10', '-', '4')), '6');
test('6*7 = 42',        formatNumber(calculate('6', '*', '7')), '42');
test('15/3 = 5',        formatNumber(calculate('15', '/', '3')), '5');
test('10/0 = Error',    formatNumber(calculate('10', '/', '0')), 'Error');
test('2^10 = 1024',     formatNumber(calculate('2', '^', '10')), '1024');
test('0.1+0.2 = 0.3',   formatNumber(calculate('0.1', '+', '0.2')), '0.3');

// ---- FORMAT EDGE CASES ----
test('format(NaN) = Error', formatNumber(NaN), 'Error');
test('format("abc") = Error', formatNumber('abc'), 'Error');
test('format(0) = 0', formatNumber(0), '0');
test('format(1e-16) = 0', formatNumber(1e-16), '0');

// ========== RESULTS ==========
console.log('\n============================');
console.log(`  RESULTS: ${passed}/${passed + failed} passed`);
console.log('============================');
if (failed > 0) {
  console.log(`\n  ${failed} FAILED tests:\n`);
  tests.forEach(t => {
    console.log(`  FAIL: ${t.name}`);
    console.log(`    got:      "${t.actual}"`);
    console.log(`    expected: "${t.expected}"\n`);
  });
} else {
  console.log('\n  ALL TESTS PASSED!\n');
}
