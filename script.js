// ============================================
// Calculator Logic
// ============================================
const Calculator = (() => {
  // State
  let currentValue = '0';
  let previousValue = '';
  let operator = null;
  let shouldResetDisplay = false;
  let expression = '';

  // DOM references
  const displayValue = document.getElementById('display-value');
  const displayExpression = document.getElementById('display-expression');
  const buttons = document.querySelectorAll('.btn');

  // Operator symbols for display
  const operatorSymbols = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
  };

  // ---- Core Operations ----
  function calculate(a, op, b) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    switch (op) {
      case '+': return numA + numB;
      case '-': return numA - numB;
      case '*': return numA * numB;
      case '/': return numB === 0 ? 'Error' : numA / numB;
      default: return numB;
    }
  }

  function formatNumber(num) {
    if (num === 'Error') return 'Error';
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return 'Error';
    if (Math.abs(parsed) > 999999999999) {
      return parsed.toExponential(4);
    }
    // Limit decimal places to avoid floating point display issues
    const str = parseFloat(parsed.toPrecision(12)).toString();
    return str;
  }

  // ---- Display ----
  function updateDisplay() {
    displayValue.textContent = currentValue;
    displayExpression.textContent = expression;
    // Shrink text if it gets long
    displayValue.classList.toggle('shrink', currentValue.length > 10);
  }

  // ---- Handlers ----
  function handleNumber(value) {
    if (shouldResetDisplay) {
      currentValue = value;
      shouldResetDisplay = false;
    } else {
      if (currentValue === '0' && value !== '.') {
        currentValue = value;
      } else {
        if (currentValue.length >= 15) return; // max digits
        currentValue += value;
      }
    }
    updateDisplay();
  }

  function handleDecimal() {
    if (shouldResetDisplay) {
      currentValue = '0.';
      shouldResetDisplay = false;
      updateDisplay();
      return;
    }
    if (!currentValue.includes('.')) {
      currentValue += '.';
    }
    updateDisplay();
  }

  function handleOperator(op) {
    if (operator && !shouldResetDisplay) {
      // Chain operations
      const result = calculate(previousValue, operator, currentValue);
      currentValue = formatNumber(result);
    }
    previousValue = currentValue;
    operator = op;
    shouldResetDisplay = true;
    expression = `${previousValue} ${operatorSymbols[op]}`;

    // Highlight active operator
    clearActiveOperator();
    const activeBtn = document.querySelector(`[data-value="${op}"].btn-operator`);
    if (activeBtn) activeBtn.classList.add('active');

    updateDisplay();
  }

  function handleEquals() {
    if (!operator) return;
    const result = calculate(previousValue, operator, currentValue);
    expression = `${previousValue} ${operatorSymbols[operator]} ${currentValue} =`;
    currentValue = formatNumber(result);
    operator = null;
    previousValue = '';
    shouldResetDisplay = true;
    clearActiveOperator();
    updateDisplay();
  }

  function handleClear() {
    currentValue = '0';
    previousValue = '';
    operator = null;
    shouldResetDisplay = false;
    expression = '';
    clearActiveOperator();
    updateDisplay();
  }

  function handleSign() {
    if (currentValue === '0' || currentValue === 'Error') return;
    currentValue = currentValue.startsWith('-')
      ? currentValue.slice(1)
      : '-' + currentValue;
    updateDisplay();
  }

  function handlePercent() {
    if (currentValue === 'Error') return;
    currentValue = formatNumber(parseFloat(currentValue) / 100);
    updateDisplay();
  }

  function clearActiveOperator() {
    document.querySelectorAll('.btn-operator').forEach(btn => {
      btn.classList.remove('active');
    });
  }

  // ---- Ripple Effect ----
  function createRipple(e, button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - 10;
    const y = e.clientY - rect.top - 10;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  // ---- Event Delegation ----
  function handleButtonClick(e) {
    const button = e.target.closest('.btn');
    if (!button) return;

    createRipple(e, button);

    const action = button.dataset.action;
    const value = button.dataset.value;

    // Clear active operator on non-operator press
    if (action !== 'operator') {
      clearActiveOperator();
    }

    switch (action) {
      case 'number':   handleNumber(value); break;
      case 'decimal':  handleDecimal(); break;
      case 'operator': handleOperator(value); break;
      case 'equals':   handleEquals(); break;
      case 'clear':    handleClear(); break;
      case 'sign':     handleSign(); break;
      case 'percent':  handlePercent(); break;
    }
  }

  // ---- Keyboard Support ----
  function handleKeyboard(e) {
    const key = e.key;
    if (key >= '0' && key <= '9') handleNumber(key);
    else if (key === '.') handleDecimal();
    else if (key === '+') handleOperator('+');
    else if (key === '-') handleOperator('-');
    else if (key === '*') handleOperator('*');
    else if (key === '/') { e.preventDefault(); handleOperator('/'); }
    else if (key === 'Enter' || key === '=') handleEquals();
    else if (key === 'Escape' || key === 'c' || key === 'C') handleClear();
    else if (key === '%') handlePercent();

    updateDisplay();
  }

  // ---- Init ----
  function init() {
    document.querySelector('.buttons').addEventListener('click', handleButtonClick);
    document.addEventListener('keydown', handleKeyboard);
    updateDisplay();
  }

  return { init };
})();

// Start the calculator
Calculator.init();
