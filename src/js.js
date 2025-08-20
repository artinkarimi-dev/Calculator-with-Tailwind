
(function () {
    const cb = document.getElementById('themeToggle');

    const saved = localStorage.getItem('theme');
    if (saved === 'dark') cb.checked = true;
    else if (saved === 'light') cb.checked = false;


    cb.addEventListener('change', () => {
        localStorage.setItem('theme', cb.checked ? 'dark' : 'light');
    });
})();


(function () {

    const displays = Array.from(document.querySelectorAll('#root-light main p, #root-dark main p'));
    const allButtons = Array.from(document.querySelectorAll('#root-light main button, #root-dark main button'));


    let current = '0';
    let previous = null;
    let operator = null;
    let justEvaluated = false;


    const MAX_LEN = 14;

    function formatNumber(str) {

        if (str.length > 50) str = str.slice(0, 50);

        if (str !== '0' && !str.startsWith('0.') && !str.startsWith('-0.')) {

            str = str.replace(/^(-?)0+(\d)/, '$1$2');
        }

        if (str.replace('-', '').length > MAX_LEN) {
            const num = Number(str);
            if (Number.isFinite(num)) return num.toExponential(6);
        }
        return str;
    }

    function updateDisplay() {
        const text = formatNumber(current);
        for (const d of displays) d.textContent = text;
    }

    function setCurrent(val) {
        current = String(val);
        updateDisplay();
    }

    function clearAll() {
        current = '0';
        previous = null;
        operator = null;
        justEvaluated = false;
        updateDisplay();
    }

    function clearEntry() {
        current = '0';
        justEvaluated = false;
        updateDisplay();
    }

    function backspace() {
        if (justEvaluated) {
            clearEntry();
            return;
        }
        if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
            current = '0';
        } else {
            current = current.slice(0, -1);
        }
        updateDisplay();
    }

    function inputDigit(d) {
        if (justEvaluated) {
            current = d;
            justEvaluated = false;
        } else {
            if (current === '0') current = d;
            else current += d;
        }
        updateDisplay();
    }

    function inputDot() {
        if (justEvaluated) {
            current = '0.';
            justEvaluated = false;
            updateDisplay();
            return;
        }
        if (!current.includes('.')) {
            current += '.';
            updateDisplay();
        }
    }

    function toggleSign() {
        if (current === '0') return;
        current = current.startsWith('-') ? current.slice(1) : ('-' + current);
        updateDisplay();
    }

    function setOperator(op) {

        if (operator && previous !== null && !justEvaluated) {
            equals();
        }
        previous = Number(current);
        operator = op;
        justEvaluated = false;
        current = '0';
        updateDisplay();
    }

    function doUnary(fn) {
        const x = Number(current);
        if (!Number.isFinite(x)) return;

        let res;
        switch (fn) {
            case 'inv':
                if (x === 0) { setCurrent('Cannot divide by 0'); justEvaluated = true; return; }
                res = 1 / x; break;
            case 'sqr':
                res = x * x; break;
            case 'sqrt':
                if (x < 0) { setCurrent('Invalid input'); justEvaluated = true; return; }
                res = Math.sqrt(x); break;
            case 'percent':

                if (previous !== null && operator) {
                    res = previous * (x / 100);
                } else {
                    res = x / 100;
                }
                break;
            default:
                return;
        }
        setCurrent(String(res));
        justEvaluated = true;
    }

    function equals() {
        if (operator === null || previous === null) {
            justEvaluated = true;
            return;
        }
        const a = previous;
        const b = Number(current);
        let res;
        switch (operator) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/':
                if (b === 0) { setCurrent('Cannot divide by 0'); previous = null; operator = null; justEvaluated = true; return; }
                res = a / b; break;
            default: return;
        }
        setCurrent(String(res));
        previous = null;
        operator = null;
        justEvaluated = true;
    }


    function handleButton(btn) {
        const hasBackIcon = !!btn.querySelector('.fa-delete-left');
        if (hasBackIcon) { backspace(); return; }

        const text = (btn.textContent || '').trim();

        if (/^\d$/.test(text)) {
            inputDigit(text);
            return;
        }

        switch (text) {
            case '.': inputDot(); break;
            case '+/-': toggleSign(); break;
            case 'C': clearAll(); break;
            case 'CE': clearEntry(); break;
            case '=': equals(); break;
            case '+': setOperator('+'); break;
            case '-': setOperator('-'); break;
            case 'x': setOperator('*'); break;
            case '÷': setOperator('/'); break;
            case '%': doUnary('percent'); break;
            case '1/x': doUnary('inv'); break;
            case 'x²': doUnary('sqr'); break;
            case '²√x': doUnary('sqrt'); break;
            default:

                break;
        }
    }


    allButtons.forEach(btn => {
        btn.addEventListener('click', () => handleButton(btn));
    });


    window.addEventListener('keydown', (e) => {
        const k = e.key;
        if (/\d/.test(k)) { inputDigit(k); return; }
        switch (k) {
            case '.': case ',': inputDot(); break;
            case '+': setOperator('+'); break;
            case '-': setOperator('-'); break;
            case '*': setOperator('*'); break;
            case '/': setOperator('/'); break;
            case 'Enter': case '=': equals(); break;
            case 'Backspace': backspace(); break;
            case 'Escape': case 'Delete': clearEntry(); break;
            case '%': doUnary('percent'); break;
        }
    });


    updateDisplay();
})();