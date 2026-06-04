// ============================================
// Advanced Scientific Calculator
// ============================================
const Calculator = (() => {
  // ---- State ----
  let currentValue = '0';
  let previousValue = '';
  let operator = null;
  let shouldResetDisplay = false;
  let expression = '';
  let memory = 0;
  let history = [];
  let isScientificMode = false;

  // ---- DOM ----
  const displayValue = document.getElementById('display-value');
  const displayExpression = document.getElementById('display-expression');
  const memoryIndicator = document.getElementById('memory-indicator');
  const scientificButtons = document.getElementById('scientific-buttons');
  const historyPanel = document.getElementById('history-panel');
  const historyList = document.getElementById('history-list');
  const historyEmpty = document.getElementById('history-empty');
  const modeIndicator = document.getElementById('mode-indicator');
  const toast = document.getElementById('toast');
  const calcEl = document.getElementById('calculator');

  const operatorSymbols = { '+': '+', '-': '−', '*': '×', '/': '÷', '^': '^' };

  // ============================================
  // Core Math
  // ============================================
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
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return 'Error';
    if (!isFinite(parsed)) return parsed > 0 ? '∞' : '-∞';
    if (Math.abs(parsed) > 999999999999) return parsed.toExponential(5);
    if (Math.abs(parsed) < 0.000001 && parsed !== 0) return parsed.toExponential(5);
    return parseFloat(parsed.toPrecision(12)).toString();
  }

  // ============================================
  // Display
  // ============================================
  function updateDisplay() {
    displayValue.textContent = currentValue;
    displayExpression.textContent = expression;
    displayValue.classList.toggle('shrink', currentValue.length > 11);
    displayValue.classList.toggle('error', currentValue === 'Error');
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }

  // ============================================
  // Number & Decimal
  // ============================================
  function handleNumber(value) {
    if (currentValue === 'Error') handleClear();
    if (shouldResetDisplay) {
      currentValue = value;
      shouldResetDisplay = false;
    } else {
      if (currentValue === '0' && value !== '.') {
        currentValue = value;
      } else {
        if (currentValue.length >= 16) return;
        currentValue += value;
      }
    }
    updateDisplay();
  }

  function handleDecimal() {
    if (currentValue === 'Error') handleClear();
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

  // ============================================
  // Operators
  // ============================================
  function handleOperator(op) {
    if (currentValue === 'Error') return;
    if (operator && !shouldResetDisplay) {
      const result = calculate(previousValue, operator, currentValue);
      currentValue = formatNumber(result);
      if (currentValue === 'Error') {
        updateDisplay();
        return;
      }
    }
    previousValue = currentValue;
    operator = op;
    shouldResetDisplay = true;
    expression = `${previousValue} ${operatorSymbols[op] || op}`;
    clearActiveOperator();
    const activeBtn = document.querySelector(`[data-value="${op}"].btn-operator`);
    if (activeBtn) activeBtn.classList.add('active');
    updateDisplay();
  }

  function handleEquals() {
    if (!operator) return;
    const result = calculate(previousValue, operator, currentValue);
    const fullExpr = `${previousValue} ${operatorSymbols[operator] || operator} ${currentValue}`;
    expression = `${fullExpr} =`;
    const formattedResult = formatNumber(result);

    // Add to history
    addToHistory(fullExpr, formattedResult);

    currentValue = formattedResult;
    operator = null;
    previousValue = '';
    shouldResetDisplay = true;
    clearActiveOperator();
    updateDisplay();
  }

  // ============================================
  // Utility Actions
  // ============================================
  function handleClear() {
    currentValue = '0';
    previousValue = '';
    operator = null;
    shouldResetDisplay = false;
    expression = '';
    clearActiveOperator();
    updateDisplay();
  }

  function handleBackspace() {
    if (currentValue === 'Error' || shouldResetDisplay) {
      handleClear();
      return;
    }
    if (currentValue.length === 1 || (currentValue.length === 2 && currentValue.startsWith('-'))) {
      currentValue = '0';
    } else {
      currentValue = currentValue.slice(0, -1);
    }
    updateDisplay();
  }

  function handlePercent() {
    if (currentValue === 'Error') return;
    currentValue = formatNumber(parseFloat(currentValue) / 100);
    updateDisplay();
  }

  function clearActiveOperator() {
    document.querySelectorAll('.btn-operator').forEach(btn => btn.classList.remove('active'));
  }

  // ============================================
  // Scientific Functions
  // ============================================
  function handleFunction(func) {
    if (currentValue === 'Error') return;
    const num = parseFloat(currentValue);
    let result;

    switch (func) {
      case 'sin':
        result = Math.sin(num * Math.PI / 180); // degrees
        expression = `sin(${currentValue})`;
        break;
      case 'cos':
        result = Math.cos(num * Math.PI / 180);
        expression = `cos(${currentValue})`;
        break;
      case 'tan':
        if (Math.abs(num % 180) === 90) { result = 'Error'; }
        else { result = Math.tan(num * Math.PI / 180); }
        expression = `tan(${currentValue})`;
        break;
      case 'log':
        result = num <= 0 ? 'Error' : Math.log10(num);
        expression = `log(${currentValue})`;
        break;
      case 'ln':
        result = num <= 0 ? 'Error' : Math.log(num);
        expression = `ln(${currentValue})`;
        break;
      case 'sqrt':
        result = num < 0 ? 'Error' : Math.sqrt(num);
        expression = `√(${currentValue})`;
        break;
      case 'square':
        result = num * num;
        expression = `(${currentValue})²`;
        break;
      case 'factorial':
        result = num < 0 || num > 170 ? 'Error' : factorial(num);
        expression = `${currentValue}!`;
        break;
      case 'inv':
        result = num === 0 ? 'Error' : 1 / num;
        expression = `1/(${currentValue})`;
        break;
      case 'abs':
        result = Math.abs(num);
        expression = `|${currentValue}|`;
        break;
      default:
        return;
    }

    const formatted = formatNumber(result);
    addToHistory(expression, formatted);
    currentValue = formatted;
    shouldResetDisplay = true;
    updateDisplay();
  }

  function handleConstant(constant) {
    switch (constant) {
      case 'pi':
        currentValue = formatNumber(Math.PI);
        break;
      case 'e':
        currentValue = formatNumber(Math.E);
        break;
    }
    shouldResetDisplay = true;
    updateDisplay();
  }

  // ============================================
  // Memory
  // ============================================
  function updateMemoryIndicator() {
    memoryIndicator.classList.toggle('visible', memory !== 0);
  }

  function handleMemory(action) {
    const num = parseFloat(currentValue) || 0;
    switch (action) {
      case 'mc':
        memory = 0;
        showToast('Memory cleared');
        break;
      case 'mr':
        currentValue = formatNumber(memory);
        shouldResetDisplay = true;
        break;
      case 'm+':
        memory += num;
        shouldResetDisplay = true;
        showToast(`M+ ${formatNumber(num)}`);
        break;
      case 'm-':
        memory -= num;
        shouldResetDisplay = true;
        showToast(`M− ${formatNumber(num)}`);
        break;
    }
    updateMemoryIndicator();
    updateDisplay();
  }

  // ============================================
  // History
  // ============================================
  function addToHistory(expr, result) {
    if (result === 'Error') return;
    history.unshift({ expr, result, time: Date.now() });
    if (history.length > 50) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyEmpty.style.display = history.length === 0 ? 'block' : 'none';
    // Remove existing items
    historyList.querySelectorAll('.history-item').forEach(el => el.remove());

    history.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-item-expr">${escapeHtml(item.expr)}</div>
        <div class="history-item-result">= ${escapeHtml(item.result)}</div>
      `;
      div.addEventListener('click', () => {
        currentValue = item.result;
        shouldResetDisplay = true;
        updateDisplay();
      });
      historyList.appendChild(div);
    });
  }

  function clearHistory() {
    history = [];
    renderHistory();
    showToast('History cleared');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ============================================
  // Mode Toggle
  // ============================================
  function setMode(mode) {
    isScientificMode = mode === 'scientific';
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    modeIndicator.classList.toggle('scientific', isScientificMode);
    scientificButtons.classList.toggle('visible', isScientificMode);
    calcEl.classList.toggle('scientific-mode', isScientificMode);
  }

  // ============================================
  // Copy
  // ============================================
  function copyResult() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentValue).then(() => showToast('Copied!'));
    } else {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = currentValue;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied!');
    }
  }

  // ============================================
  // Ripple Effect
  // ============================================
  function createRipple(e, button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    const rect = button.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left - 10}px`;
    ripple.style.top = `${e.clientY - rect.top - 10}px`;
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  // ============================================
  // Event Handlers
  // ============================================
  function handleButtonClick(e) {
    const button = e.target.closest('.btn');
    if (!button) return;

    createRipple(e, button);

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action !== 'operator') clearActiveOperator();

    switch (action) {
      case 'number':    handleNumber(value); break;
      case 'decimal':   handleDecimal(); break;
      case 'operator':  handleOperator(value); break;
      case 'equals':    handleEquals(); break;
      case 'clear':     handleClear(); break;
      case 'backspace': handleBackspace(); break;
      case 'percent':   handlePercent(); break;
      case 'func':      handleFunction(value); break;
      case 'constant':  handleConstant(value); break;
      case 'paren':     handleNumber(value); break; // Simplified paren handling
      case 'mc': case 'mr': case 'm+': case 'm-':
        handleMemory(action); break;
    }
  }

  function handleKeyboard(e) {
    const key = e.key;
    if (key >= '0' && key <= '9') handleNumber(key);
    else if (key === '.') handleDecimal();
    else if (key === '+') handleOperator('+');
    else if (key === '-') handleOperator('-');
    else if (key === '*') handleOperator('*');
    else if (key === '/') { e.preventDefault(); handleOperator('/'); }
    else if (key === '^') handleOperator('^');
    else if (key === 'Enter' || key === '=') { e.preventDefault(); handleEquals(); }
    else if (key === 'Escape') handleClear();
    else if (key === 'Backspace') handleBackspace();
    else if (key === '%') handlePercent();
    else return; // Don't update display for unhandled keys

    clearActiveOperator();
    updateDisplay();
  }

  // ============================================
  // Init
  // ============================================
  function init() {
    // Button clicks (delegation)
    document.querySelector('.calculator').addEventListener('click', handleButtonClick);

    // Keyboard
    document.addEventListener('keydown', handleKeyboard);

    // Mode toggle
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    // History toggle
    document.getElementById('btn-toggle-history').addEventListener('click', function() {
      historyPanel.classList.toggle('open');
      this.classList.toggle('active');
    });

    // Clear history
    document.getElementById('btn-clear-history').addEventListener('click', clearHistory);

    // Copy
    document.getElementById('btn-copy').addEventListener('click', copyResult);

    // Initial render
    updateDisplay();
  }

  return { init };
})();

Calculator.init();
