/**
 * Budget Manager - Application Logic & UI Controller
 */

class BudgetCalculator {
  constructor(app) {
    this.app = app;
    this.currentInput = '0';
    this.previousInput = null;
    this.operator = null;
    this.historyText = '';
    this.shouldResetInput = false;
    this.isOpen = false;
  }

  open() {
    this.isOpen = true;
    const modal = document.getElementById('calculatorModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    this.updateDisplay();
  }

  close() {
    this.isOpen = false;
    const modal = document.getElementById('calculatorModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  inputDigit(digit) {
    if (this.shouldResetInput || this.currentInput === 'Error') {
      this.currentInput = digit === '00' ? '0' : digit;
      this.shouldResetInput = false;
    } else {
      if (this.currentInput === '0') {
        if (digit === '00') return;
        this.currentInput = digit;
      } else {
        if (this.currentInput.length >= 14) return;
        this.currentInput += digit;
      }
    }
    this.updateDisplay();
  }

  inputDecimal() {
    if (this.shouldResetInput || this.currentInput === 'Error') {
      this.currentInput = '0.';
      this.shouldResetInput = false;
      this.updateDisplay();
      return;
    }
    if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
      this.updateDisplay();
    }
  }

  inputOperator(op) {
    if (this.currentInput === 'Error') return;
    const curVal = parseFloat(this.currentInput);
    if (isNaN(curVal)) return;

    if (this.operator && !this.shouldResetInput) {
      this.calculate();
    }

    this.previousInput = parseFloat(this.currentInput);
    this.operator = op;
    this.shouldResetInput = true;

    const symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    this.historyText = `${this.previousInput} ${symbolMap[op] || op}`;
    this.updateDisplay();
  }

  calculate() {
    if (this.operator === null || this.previousInput === null) return;
    const prev = this.previousInput;
    const current = parseFloat(this.currentInput);
    if (isNaN(current)) return;

    let result = 0;
    switch (this.operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          this.currentInput = 'Error';
          this.previousInput = null;
          this.operator = null;
          this.historyText = 'Cannot divide by 0';
          this.shouldResetInput = true;
          this.updateDisplay();
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }

    // Clean floating point precision (e.g. 0.1 + 0.2 = 0.3)
    const rounded = Math.round((result + Number.EPSILON) * 100000000) / 100000000;
    const symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    this.historyText = `${prev} ${symbolMap[this.operator] || this.operator} ${current} =`;
    this.currentInput = String(rounded);
    this.operator = null;
    this.previousInput = null;
    this.shouldResetInput = true;
    this.updateDisplay();
  }

  inputPercent() {
    if (this.currentInput === 'Error') return;
    const current = parseFloat(this.currentInput);
    if (isNaN(current)) return;
    if (this.previousInput !== null && (this.operator === '+' || this.operator === '-')) {
      const pct = (this.previousInput * current) / 100;
      this.currentInput = String(Math.round((pct + Number.EPSILON) * 100000000) / 100000000);
    } else {
      this.currentInput = String(Math.round((current / 100 + Number.EPSILON) * 100000000) / 100000000);
    }
    this.updateDisplay();
  }

  backspace() {
    if (this.shouldResetInput || this.currentInput === 'Error') {
      this.clear();
      return;
    }
    if (this.currentInput.length <= 1) {
      this.currentInput = '0';
    } else {
      this.currentInput = this.currentInput.slice(0, -1);
    }
    this.updateDisplay();
  }

  clear() {
    this.currentInput = '0';
    this.previousInput = null;
    this.operator = null;
    this.historyText = '';
    this.shouldResetInput = false;
    this.updateDisplay();
  }

  copyResult() {
    const val = this.currentInput === 'Error' ? '0' : this.currentInput;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val)
        .then(() => this.showCopyFeedback())
        .catch(() => this.fallbackCopy(val));
    } else {
      this.fallbackCopy(val);
    }
  }

  fallbackCopy(text) {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      this.showCopyFeedback();
    } catch (e) {
      console.warn('Copy fallback failed', e);
    }
    document.body.removeChild(el);
  }

  showCopyFeedback() {
    const textEl = document.getElementById('calcCopyText');
    const iconEl = document.getElementById('calcCopyIcon');
    const btn = document.getElementById('calcCopyResultBtn');
    if (textEl && iconEl && btn) {
      textEl.textContent = 'Copied!';
      iconEl.className = 'fa-solid fa-check text-emerald-500 text-xs';
      btn.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-300', 'dark:bg-emerald-950/80', 'dark:text-emerald-300');
      btn.classList.remove('bg-indigo-50', 'text-indigo-700', 'border-indigo-200/70', 'dark:bg-indigo-950/80', 'dark:text-indigo-300');
      setTimeout(() => {
        textEl.textContent = 'Copy Result';
        iconEl.className = 'fa-regular fa-copy text-xs';
        btn.classList.remove('bg-emerald-50', 'text-emerald-700', 'border-emerald-300', 'dark:bg-emerald-950/80', 'dark:text-emerald-300');
        btn.classList.add('bg-indigo-50', 'text-indigo-700', 'border-indigo-200/70', 'dark:bg-indigo-950/80', 'dark:text-indigo-300');
      }, 1800);
    }
  }

  updateDisplay() {
    const displayEl = document.getElementById('calcDisplay');
    const historyEl = document.getElementById('calcHistory');
    if (displayEl) {
      displayEl.textContent = this.currentInput;
    }
    if (historyEl) {
      historyEl.textContent = this.historyText;
    }
  }
}

class BudgetApp {
  constructor() {
    this.storageKey = 'budget_manager_v1';
    this.themeStorageKey = 'budget_manager_theme';
    this.engine = new window.BudgetEngine();
    this.charts = new window.BudgetCharts();
    this.calculator = new BudgetCalculator(this);
    this.listenersAttached = false;
    
    // Default current month format: YYYY-MM
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    this.currentMonthKey = `${year}-${month}`;

    // Default currency to RM as requested
    this.currency = 'RM';
    this.currencies = [
      { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit (RM)' },
      { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
      { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
      { code: 'EUR', symbol: '€', name: 'Euro (€)' },
      { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
      { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
      { code: 'PHP', symbol: '₱', name: 'Philippine Peso (₱)' },
      { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah (Rp)' }
    ];

    this.activeMobileTab = 'budget';
    this.theme = this.initTheme();
    this.data = this.loadFromStorage();
    this.init();
  }

  initTheme() {
    let savedTheme = localStorage.getItem(this.themeStorageKey);
    if (!savedTheme) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      savedTheme = prefersDark ? 'dark' : 'light';
    }
    this.applyTheme(savedTheme);
    return savedTheme;
  }

  applyTheme(theme) {
    this.theme = theme;
    localStorage.setItem(this.themeStorageKey, theme);
    const htmlEl = document.documentElement;
    const themeIcon = document.getElementById('themeToggleIcon');
    const themeText = document.getElementById('themeToggleText');
    const drawerThemeIcon = document.getElementById('drawerThemeToggleIcon');
    const drawerThemeText = document.getElementById('drawerThemeToggleText');

    if (theme === 'dark') {
      htmlEl.classList.add('dark');
      if (themeIcon) {
        themeIcon.className = 'fa-solid fa-sun text-amber-400';
      }
      if (themeText) {
        themeText.textContent = 'Light';
      }
      if (drawerThemeIcon) {
        drawerThemeIcon.className = 'fa-solid fa-sun text-amber-400 text-sm';
      }
      if (drawerThemeText) {
        drawerThemeText.textContent = 'Light';
      }
    } else {
      htmlEl.classList.remove('dark');
      if (themeIcon) {
        themeIcon.className = 'fa-solid fa-moon text-slate-600';
      }
      if (themeText) {
        themeText.textContent = 'Dark';
      }
      if (drawerThemeIcon) {
        drawerThemeIcon.className = 'fa-solid fa-moon text-slate-600 text-sm';
      }
      if (drawerThemeText) {
        drawerThemeText.textContent = 'Dark';
      }
    }
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
    // Re-render charts so their grid and text colors update
    if (this.charts) {
      this.charts.destroyAll();
      this.recalculateAndRenderOverview();
    }
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.currency) this.currency = parsed.currency;
        return parsed.months || {};
      }
    } catch (e) {
      console.warn('Could not parse local storage:', e);
    }
    return {};
  }

  saveToStorage() {
    try {
      const payload = {
        currency: this.currency,
        months: this.data
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }

  ensureMonthStructure(monthKey) {
    if (!this.data[monthKey]) {
      this.data[monthKey] = {
        incomeList: [
          { id: 'primary_salary', name: 'Monthly Salary / Allowance', amount: '' }
        ],
        expenses: {
          presets: {
            food: { active: true, amount: '' },
            transport: { active: true, amount: '' },
            entertainment: { active: true, amount: '' },
            saving: { active: true, amount: '' },
            rental: { active: true, amount: '' },
            loan: { active: true, amount: '' },
            installment: { active: true, amount: '' },
            utilities: { active: false, amount: '' },
            healthcare: { active: false, amount: '' },
            shopping: { active: false, amount: '' }
          },
          custom: []
        }
      };
      this.saveToStorage();
    }
    return this.data[monthKey];
  }

  getCurrentMonthData() {
    return this.ensureMonthStructure(this.currentMonthKey);
  }

  init() {
    this.renderCurrencySelector();
    this.renderMonthSelector();
    this.renderAll();
    this.attachEventListeners();
    this.switchMobileTab('budget');
  }

  formatMoney(num) {
    const val = parseFloat(num) || 0;
    return `${this.currency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatMonthDisplay(monthKey) {
    const [y, m] = monthKey.split('-').map(Number);
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  renderCurrencySelector() {
    const select = document.getElementById('currencySelector');
    const drawerSelect = document.getElementById('drawerCurrencySelector');
    const optionsHtml = this.currencies.map(c => 
      `<option value="${c.symbol}" ${c.symbol === this.currency ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    if (select) select.innerHTML = optionsHtml;
    if (drawerSelect) drawerSelect.innerHTML = optionsHtml;

    // Update any static currency label in the DOM
    document.querySelectorAll('.currency-label-display').forEach(el => {
      el.textContent = this.currency;
    });
  }

  toggleMobileDrawer(open) {
    const drawer = document.getElementById('mobileSideDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (!drawer || !backdrop) return;

    if (open) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
      drawer.classList.remove('translate-x-full');
      drawer.classList.add('translate-x-0');
      document.body.style.overflow = 'hidden';
    } else {
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      drawer.classList.add('translate-x-full');
      drawer.classList.remove('translate-x-0');
      document.body.style.overflow = '';
    }
  }

  renderMonthSelector() {
    const monthDisplay = document.getElementById('currentMonthDisplay');
    if (monthDisplay) {
      monthDisplay.textContent = this.formatMonthDisplay(this.currentMonthKey);
    }
    const monthInput = document.getElementById('monthPickerInput');
    if (monthInput) {
      monthInput.value = this.currentMonthKey;
    }
  }

  attachEventListeners() {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    // Dark mode toggle
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => this.toggleTheme());

    // Month navigation with exact integer step
    document.getElementById('prevMonthBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateMonth(-1);
    });

    document.getElementById('nextMonthBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.navigateMonth(1);
    });

    // Calendar picker button
    const monthPickerInput = document.getElementById('monthPickerInput');
    const openDatePickerBtn = document.getElementById('openDatePickerBtn');
    const currentMonthDisplay = document.getElementById('currentMonthDisplay');

    const triggerDatePicker = () => {
      if (monthPickerInput) {
        if (typeof monthPickerInput.showPicker === 'function') {
          monthPickerInput.showPicker();
        } else {
          monthPickerInput.click();
        }
      }
    };

    openDatePickerBtn?.addEventListener('click', triggerDatePicker);
    currentMonthDisplay?.addEventListener('click', triggerDatePicker);

    monthPickerInput?.addEventListener('change', (e) => {
      if (e.target.value) {
        this.currentMonthKey = e.target.value;
        this.renderMonthSelector();
        this.renderAll();
      }
    });

    // Mouse wheel scrolling on month switcher (smooth single-month steps)
    const monthSelectorContainer = document.getElementById('monthSelectorContainer');
    let wheelThrottle = false;
    monthSelectorContainer?.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (wheelThrottle) return;
      wheelThrottle = true;
      setTimeout(() => { wheelThrottle = false; }, 220);

      if (e.deltaY < 0) {
        this.navigateMonth(-1);
      } else if (e.deltaY > 0) {
        this.navigateMonth(1);
      }
    }, { passive: false });

    // Currency selector
    document.getElementById('currencySelector')?.addEventListener('change', (e) => {
      this.currency = e.target.value;
      this.saveToStorage();
      this.renderCurrencySelector();
      this.renderAll();
    });

    // Sample data demo button
    document.getElementById('loadDemoBtn')?.addEventListener('click', () => this.loadDemoData());

    // Reset month button
    document.getElementById('resetMonthBtn')?.addEventListener('click', () => this.resetCurrentMonth());

    // Copy from previous month
    document.getElementById('copyPrevMonthBtn')?.addEventListener('click', () => this.copyFromPreviousMonth());

    // Add Income Stream
    document.getElementById('addIncomeBtn')?.addEventListener('click', () => this.addIncomeStream());

    // Add Custom Expense Form toggle / submit
    document.getElementById('openAddCustomModalBtn')?.addEventListener('click', () => this.toggleCustomExpenseCard(true));
    document.getElementById('cancelAddCustomBtn')?.addEventListener('click', () => this.toggleCustomExpenseCard(false));
    document.getElementById('customExpenseForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitCustomExpense();
    });

    // Manage Preset Categories modal
    document.getElementById('managePresetsBtn')?.addEventListener('click', () => this.openManagePresetsModal());
    document.getElementById('closePresetsModalBtn')?.addEventListener('click', () => this.closeManagePresetsModal());
    document.getElementById('presetsModalBackdrop')?.addEventListener('click', () => this.closeManagePresetsModal());

    // Analytics Chart Tab switcher
    const tabBtns = document.querySelectorAll('.chart-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => {
          b.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-900', 'dark:text-white', 'shadow-sm', 'font-semibold');
          b.classList.add('text-slate-500', 'dark:text-slate-400', 'hover:text-slate-700');
        });
        const target = e.currentTarget;
        target.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-900', 'dark:text-white', 'shadow-sm', 'font-semibold');
        target.classList.remove('text-slate-500', 'dark:text-slate-400');

        const tabType = target.getAttribute('data-tab');
        this.switchChartTab(tabType);
      });
    });

    // Print summary button
    document.getElementById('printReportBtn')?.addEventListener('click', () => {
      window.print();
    });

    // Export Data (Backup)
    const handleExport = () => this.exportData();
    document.getElementById('exportDataBtn')?.addEventListener('click', handleExport);
    document.getElementById('footerExportBtn')?.addEventListener('click', handleExport);

    // Import Data (Restore)
    const fileInput = document.getElementById('importFileInput');
    const triggerImport = () => fileInput?.click();
    document.getElementById('importDataBtn')?.addEventListener('click', triggerImport);
    document.getElementById('footerImportBtn')?.addEventListener('click', triggerImport);

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        this.importData(file);
      }
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    });

    // Clear all data
    document.getElementById('clearAllDataBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all stored budgets? This cannot be undone.')) {
        localStorage.removeItem(this.storageKey);
        this.data = {};
        this.currentMonthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        this.renderMonthSelector();
        this.renderAll();
      }
    });

    // Mobile side drawer controls
    document.getElementById('mobileDrawerToggleBtn')?.addEventListener('click', () => this.toggleMobileDrawer(true));
    document.getElementById('closeMobileDrawerBtn')?.addEventListener('click', () => this.toggleMobileDrawer(false));
    document.getElementById('mobileDrawerBackdrop')?.addEventListener('click', () => this.toggleMobileDrawer(false));

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.toggleMobileDrawer(false);
      }
    });

    // Drawer Theme Toggle
    document.getElementById('drawerThemeToggleBtn')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Drawer Currency Selector
    document.getElementById('drawerCurrencySelector')?.addEventListener('change', (e) => {
      this.currency = e.target.value;
      this.saveToStorage();
      this.renderCurrencySelector();
      this.renderAll();
    });

    // Drawer Quick Actions (Execute & auto-close drawer)
    document.getElementById('drawerLoadDemoBtn')?.addEventListener('click', () => {
      this.loadDemoData();
      this.toggleMobileDrawer(false);
    });

    document.getElementById('drawerCopyPrevMonthBtn')?.addEventListener('click', () => {
      this.copyFromPreviousMonth();
      this.toggleMobileDrawer(false);
    });

    document.getElementById('drawerResetMonthBtn')?.addEventListener('click', () => {
      this.resetCurrentMonth();
      this.toggleMobileDrawer(false);
    });

    document.getElementById('drawerExportBtn')?.addEventListener('click', () => {
      this.exportData();
      this.toggleMobileDrawer(false);
    });

    document.getElementById('drawerImportBtn')?.addEventListener('click', () => {
      this.toggleMobileDrawer(false);
      document.getElementById('importFileInput')?.click();
    });

    document.getElementById('drawerPrintBtn')?.addEventListener('click', () => {
      this.toggleMobileDrawer(false);
      setTimeout(() => window.print(), 250);
    });

    document.getElementById('drawerClearAllBtn')?.addEventListener('click', () => {
      this.toggleMobileDrawer(false);
      document.getElementById('clearAllDataBtn')?.click();
    });

    // Calculator Launchers (Desktop header, Mobile header, Floating button, Side drawer)
    const openCalc = () => this.calculator.open();
    document.getElementById('calculatorToggleBtn')?.addEventListener('click', openCalc);
    document.getElementById('mobileCalculatorBtn')?.addEventListener('click', openCalc);
    document.getElementById('floatingCalculatorBtn')?.addEventListener('click', openCalc);
    document.getElementById('drawerCalculatorBtn')?.addEventListener('click', () => {
      this.toggleMobileDrawer(false);
      this.calculator.open();
    });

    // Calculator Close
    const closeCalc = () => this.calculator.close();
    document.getElementById('closeCalculatorBtn')?.addEventListener('click', closeCalc);
    document.getElementById('calculatorBackdrop')?.addEventListener('click', closeCalc);

    // Calculator Copy Result Button
    document.getElementById('calcCopyResultBtn')?.addEventListener('click', () => {
      this.calculator.copyResult();
    });

    // Calculator Keypad Click Handler
    const keypad = document.getElementById('calculatorKeypad');
    keypad?.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const num = btn.getAttribute('data-calc-num');
      if (num !== null) {
        this.calculator.inputDigit(num);
        return;
      }

      const action = btn.getAttribute('data-calc-action');
      if (action === 'clear') {
        this.calculator.clear();
      } else if (action === 'backspace') {
        this.calculator.backspace();
      } else if (action === 'percent') {
        this.calculator.inputPercent();
      } else if (action === 'decimal') {
        this.calculator.inputDecimal();
      } else if (action === 'operator') {
        const op = btn.getAttribute('data-val');
        if (op) this.calculator.inputOperator(op);
      } else if (action === 'equals') {
        this.calculator.calculate();
      }
    });

    // Global Keyboard Listeners for Calculator
    window.addEventListener('keydown', (e) => {
      if (!this.calculator.isOpen) return;

      if (e.key >= '0' && e.key <= '9') {
        this.calculator.inputDigit(e.key);
      } else if (e.key === '.') {
        this.calculator.inputDecimal();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        this.calculator.inputOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        this.calculator.calculate();
      } else if (e.key === 'Backspace') {
        this.calculator.backspace();
      } else if (e.key === 'Escape') {
        this.calculator.close();
      } else if (e.key === 'c' || e.key === 'C') {
        this.calculator.clear();
      } else if (e.key === '%') {
        this.calculator.inputPercent();
      }
    });

    // Mobile Segmented Tab Navigation
    document.getElementById('mobileTabBudget')?.addEventListener('click', () => this.switchMobileTab('budget'));
    document.getElementById('mobileTabAdvisor')?.addEventListener('click', () => this.switchMobileTab('advisor'));
    document.getElementById('mobileTabCharts')?.addEventListener('click', () => this.switchMobileTab('charts'));

    // Handle responsive layout on resize / orientation change
    window.addEventListener('resize', () => {
      this.switchMobileTab(this.activeMobileTab);
    });
  }

  /**
   * Switch active view on mobile devices (Budget, Advisor, Analytics)
   */
  switchMobileTab(tab) {
    this.activeMobileTab = tab;
    const isMobile = window.innerWidth < 1024;

    const budgetBtn = document.getElementById('mobileTabBudget');
    const advisorBtn = document.getElementById('mobileTabAdvisor');
    const chartsBtn = document.getElementById('mobileTabCharts');

    const setActive = (btn, active) => {
      if (!btn) return;
      if (active) {
        btn.className = 'mobile-tab-btn py-2.5 rounded-xl bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5';
      } else {
        btn.className = 'mobile-tab-btn py-2.5 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-slate-200 transition-all flex items-center justify-center space-x-1.5';
      }
    };

    setActive(budgetBtn, tab === 'budget');
    setActive(advisorBtn, tab === 'advisor');
    setActive(chartsBtn, tab === 'charts');

    const budgetCol = document.getElementById('budgetInputsColumn');
    const analyticsCol = document.getElementById('analyticsColumn');
    const advisorSection = document.getElementById('advisorCardSection');
    const chartsSection = document.getElementById('chartsCardSection');

    if (!isMobile) {
      budgetCol?.classList.remove('hidden');
      analyticsCol?.classList.remove('hidden');
      advisorSection?.classList.remove('hidden');
      chartsSection?.classList.remove('hidden');
      return;
    }

    if (tab === 'budget') {
      budgetCol?.classList.remove('hidden');
      analyticsCol?.classList.add('hidden');
    } else if (tab === 'advisor') {
      budgetCol?.classList.add('hidden');
      analyticsCol?.classList.remove('hidden');
      advisorSection?.classList.remove('hidden');
      chartsSection?.classList.add('hidden');
    } else if (tab === 'charts') {
      budgetCol?.classList.add('hidden');
      analyticsCol?.classList.remove('hidden');
      advisorSection?.classList.add('hidden');
      chartsSection?.classList.remove('hidden');
    }
  }

  /**
   * Navigate exactly 1 month forward or backward (handles every month: odd & even)
   */
  navigateMonth(delta) {
    let [y, m] = this.currentMonthKey.split('-').map(Number);
    m += delta;
    if (m > 12) {
      y += 1;
      m = 1;
    } else if (m < 1) {
      y -= 1;
      m = 12;
    }
    this.currentMonthKey = `${y}-${String(m).padStart(2, '0')}`;
    this.renderMonthSelector();
    this.renderAll();
  }

  loadDemoData() {
    const demoMonth = {
      incomeList: [
        { id: 'primary_salary', name: 'Monthly Salary / Allowance', amount: 4500 },
        { id: 'inc_freelance', name: 'Freelance Design', amount: 800 }
      ],
      expenses: {
        presets: {
          food: { active: true, amount: 750 },
          transport: { active: true, amount: 320 },
          entertainment: { active: true, amount: 780 }, // ~14.7%, triggers entertainment insights!
          saving: { active: true, amount: 1100 },
          rental: { active: true, amount: 1200 },
          loan: { active: true, amount: 400 },
          installment: { active: true, amount: 200 },
          utilities: { active: true, amount: 180 },
          healthcare: { active: false, amount: 0 },
          shopping: { active: false, amount: 0 }
        },
        custom: [
          {
            id: 'custom_gym',
            name: 'Gym & Fitness Membership',
            classification: 'want',
            amount: 90,
            icon: 'fa-dumbbell',
            color: '#6366f1'
          },
          {
            id: 'custom_pet',
            name: 'Pet Care & Cat Food',
            classification: 'need',
            amount: 120,
            icon: 'fa-paw',
            color: '#14b8a6'
          }
        ]
      }
    };

    this.data[this.currentMonthKey] = demoMonth;
    this.saveToStorage();
    this.renderAll();

    // Confetti celebration
    if (window.confetti) {
      window.confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }

  resetCurrentMonth() {
    if (confirm(`Reset all income and expenses for ${this.formatMonthDisplay(this.currentMonthKey)}?`)) {
      delete this.data[this.currentMonthKey];
      this.ensureMonthStructure(this.currentMonthKey);
      this.renderAll();
    }
  }

  copyFromPreviousMonth() {
    let [y, m] = this.currentMonthKey.split('-').map(Number);
    m -= 1;
    if (m < 1) {
      y -= 1;
      m = 12;
    }
    const prevKey = `${y}-${String(m).padStart(2, '0')}`;

    if (!this.data[prevKey]) {
      alert(`No budget data found for previous month (${this.formatMonthDisplay(prevKey)}).`);
      return;
    }

    if (confirm(`Copy all budget entries from ${this.formatMonthDisplay(prevKey)} into ${this.formatMonthDisplay(this.currentMonthKey)}?`)) {
      this.data[this.currentMonthKey] = JSON.parse(JSON.stringify(this.data[prevKey]));
      this.saveToStorage();
      this.renderAll();
    }
  }

  /**
   * Export all budget data as a downloadable JSON backup file
   */
  exportData() {
    const payload = {
      appName: 'Budget Manager',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      currency: this.currency,
      months: this.data
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const todayStr = new Date().toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-manager-backup-${todayStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import budget data from a JSON backup file
   */
  importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        
        let importedMonths = null;
        let importedCurrency = null;

        if (parsed.months && typeof parsed.months === 'object') {
          importedMonths = parsed.months;
          importedCurrency = parsed.currency;
        } else if (typeof parsed === 'object') {
          importedMonths = parsed;
        }

        if (!importedMonths || typeof importedMonths !== 'object' || Object.keys(importedMonths).length === 0) {
          alert('No valid budget data was found in this file. Please check that you selected a valid Budget Manager backup file.');
          return;
        }

        const monthKeys = Object.keys(importedMonths);
        const monthCount = monthKeys.length;
        const confirmMsg = `Found backup file containing ${monthCount} month(s) of budget records.\n\nDo you want to restore this data? (Existing data for matching months will be updated)`;
        
        if (confirm(confirmMsg)) {
          // Merge imported months with existing data
          this.data = { ...this.data, ...importedMonths };

          if (importedCurrency) {
            this.currency = importedCurrency;
          }

          // If current month is in backup, keep it, otherwise switch to latest imported month
          if (!this.data[this.currentMonthKey] && monthKeys.length > 0) {
            this.currentMonthKey = monthKeys.sort().reverse()[0];
          }

          this.saveToStorage();
          this.renderCurrencySelector();
          this.renderMonthSelector();
          this.renderAll();

          if (window.confetti) {
            window.confetti({
              particleCount: 85,
              spread: 60,
              origin: { y: 0.6 }
            });
          }

          alert(`🎉 Successfully restored ${monthCount} month(s) of budget data!`);
        }
      } catch (err) {
        console.error('Import parsing error:', err);
        alert('Failed to parse the backup file. Please ensure it is a valid .json file.');
      }
    };

    reader.onerror = () => {
      alert('Error reading the backup file.');
    };

    reader.readAsText(file);
  }

  addIncomeStream() {
    const month = this.getCurrentMonthData();
    const id = 'inc_' + Math.random().toString(36).substr(2, 8);
    month.incomeList.push({
      id: id,
      name: 'Additional Income (e.g. Freelance, Bonus)',
      amount: ''
    });
    this.saveToStorage();
    this.renderIncomeSection();
    this.recalculateAndRenderOverview();
  }

  removeIncomeStream(id) {
    const month = this.getCurrentMonthData();
    month.incomeList = month.incomeList.filter(i => i.id !== id);
    this.saveToStorage();
    this.renderIncomeSection();
    this.recalculateAndRenderOverview();
  }

  toggleCustomExpenseCard(show) {
    const card = document.getElementById('addCustomExpenseCard');
    const openBtn = document.getElementById('openAddCustomModalBtn');
    if (!card) return;

    if (show) {
      card.classList.remove('hidden');
      openBtn?.classList.add('hidden');
      document.getElementById('customNameInput')?.focus();
    } else {
      card.classList.add('hidden');
      openBtn?.classList.remove('hidden');
      document.getElementById('customExpenseForm')?.reset();
    }
  }

  submitCustomExpense() {
    const nameInput = document.getElementById('customNameInput');
    const amountInput = document.getElementById('customAmountInput');
    const classInput = document.getElementById('customClassSelect');

    const name = nameInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    const classification = classInput.value || 'want';

    if (!name) {
      alert('Please enter a name for this custom cost.');
      nameInput.focus();
      return;
    }

    if (amount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      amountInput.focus();
      return;
    }

    let icon = 'fa-tag';
    let color = '#64748b';
    if (classification === 'need') { icon = 'fa-cart-shopping'; color = '#0284c7'; }
    else if (classification === 'want') { icon = 'fa-face-smile'; color = '#ec4899'; }
    else if (classification === 'debt') { icon = 'fa-file-invoice'; color = '#e11d48'; }
    else if (classification === 'saving') { icon = 'fa-vault'; color = '#10b981'; }

    const month = this.getCurrentMonthData();
    month.expenses.custom.push({
      id: 'custom_' + Date.now(),
      name: name,
      amount: amount,
      classification: classification,
      icon: icon,
      color: color
    });

    this.saveToStorage();
    this.toggleCustomExpenseCard(false);
    this.renderExpensesSection();
    this.recalculateAndRenderOverview();
  }

  removeCustomExpense(id) {
    const month = this.getCurrentMonthData();
    month.expenses.custom = month.expenses.custom.filter(c => c.id !== id);
    this.saveToStorage();
    this.renderExpensesSection();
    this.recalculateAndRenderOverview();
  }

  togglePresetActive(presetId, active) {
    const month = this.getCurrentMonthData();
    if (!month.expenses.presets[presetId]) {
      month.expenses.presets[presetId] = { active: active, amount: 0 };
    } else {
      month.expenses.presets[presetId].active = active;
    }
    this.saveToStorage();
    this.renderExpensesSection();
    this.recalculateAndRenderOverview();
    this.renderPresetsManagerList();
  }

  openManagePresetsModal() {
    const modal = document.getElementById('managePresetsModal');
    if (!modal) return;
    this.renderPresetsManagerList();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeManagePresetsModal() {
    const modal = document.getElementById('managePresetsModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  renderPresetsManagerList() {
    const container = document.getElementById('presetsManagerList');
    if (!container) return;

    const month = this.getCurrentMonthData();
    const presets = month.expenses?.presets || {};

    container.innerHTML = this.engine.presetDefinitions.map(def => {
      const entry = presets[def.id];
      const isActive = entry ? entry.active : def.defaultActive;

      return `
        <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all bg-white dark:bg-slate-800">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base shadow-sm shrink-0" style="background-color: ${def.color}">
              <i class="fa-solid ${def.icon}"></i>
            </div>
            <div>
              <div class="font-semibold text-slate-800 dark:text-slate-100 text-sm">${def.name}</div>
              <div class="text-xs text-slate-400 dark:text-slate-400 capitalize">${def.classification} • ${def.hint}</div>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" class="sr-only peer" ${isActive ? 'checked' : ''} onchange="window.budgetApp.togglePresetActive('${def.id}', this.checked)">
            <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      `;
    }).join('');
  }

  switchChartTab(tab) {
    const donutSection = document.getElementById('donutChartContainer');
    const flowSection = document.getElementById('flowChartContainer');
    const ruleSection = document.getElementById('rule503020Container');

    if (!donutSection || !flowSection || !ruleSection) return;

    donutSection.classList.add('hidden');
    flowSection.classList.add('hidden');
    ruleSection.classList.add('hidden');

    if (tab === 'donut') donutSection.classList.remove('hidden');
    else if (tab === 'flow') flowSection.classList.remove('hidden');
    else if (tab === 'rule') ruleSection.classList.remove('hidden');
  }

  renderAll() {
    this.renderIncomeSection();
    this.renderExpensesSection();
    this.recalculateAndRenderOverview();
  }

  renderIncomeSection() {
    const container = document.getElementById('incomeInputsContainer');
    if (!container) return;

    const month = this.getCurrentMonthData();
    const incomeList = month.incomeList || [];

    container.innerHTML = incomeList.map((item, index) => {
      const isPrimary = index === 0;
      return `
        <div class="income-item group relative bg-white dark:bg-slate-850 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3.5 sm:p-4 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all mb-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3 flex-1">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/60">
                <i class="fa-solid fa-wallet text-base"></i>
              </div>
              <div class="flex-1 min-w-0">
                ${isPrimary 
                  ? `<div class="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">${item.name}</div>
                     <div class="text-xs text-slate-400 dark:text-slate-400">Primary take-home allowance or salary</div>`
                  : `<input type="text" value="${item.name}" 
                      placeholder="Income source title"
                      class="font-semibold text-slate-800 dark:text-slate-100 text-sm w-full bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-emerald-500 py-0.5" 
                      onchange="window.budgetApp.updateIncomeName('${item.id}', this.value)">`
                }
              </div>
            </div>

            <div class="flex items-center space-x-2 self-end sm:self-auto">
              <div class="relative w-40 sm:w-44">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-semibold pointer-events-none">
                  ${this.currency}
                </span>
                <input type="number" 
                  step="any" 
                  min="0"
                  inputmode="decimal"
                  value="${item.amount !== undefined && item.amount !== '' ? item.amount : ''}" 
                  placeholder="0.00"
                  class="w-full pl-11 pr-3 py-2 text-right font-mono-numbers font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950 transition-all text-sm"
                  oninput="window.budgetApp.updateIncomeAmount('${item.id}', this.value)">
              </div>

              ${!isPrimary ? `
                <button type="button" 
                  onclick="window.budgetApp.removeIncomeStream('${item.id}')"
                  class="p-2 text-slate-300 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Remove this income stream">
                  <i class="fa-solid fa-trash-can text-sm"></i>
                </button>
              ` : `
                <div class="w-8"></div>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateIncomeName(id, name) {
    const month = this.getCurrentMonthData();
    const item = month.incomeList.find(i => i.id === id);
    if (item) {
      item.name = name;
      this.saveToStorage();
    }
  }

  updateIncomeAmount(id, val) {
    const month = this.getCurrentMonthData();
    const item = month.incomeList.find(i => i.id === id);
    if (item) {
      item.amount = val === '' ? '' : parseFloat(val);
      this.saveToStorage();
      this.recalculateAndRenderOverview();
    }
  }

  renderExpensesSection() {
    const container = document.getElementById('expenseInputsContainer');
    if (!container) return;

    const month = this.getCurrentMonthData();
    const presets = month.expenses?.presets || {};
    const customList = month.expenses?.custom || [];

    let html = '';

    // Render Preset Items
    for (const def of this.engine.presetDefinitions) {
      const entry = presets[def.id];
      const isActive = entry ? entry.active : def.defaultActive;
      const amount = entry && entry.amount !== undefined && entry.amount !== '' ? entry.amount : '';

      if (isActive) {
        let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
        if (def.classification === 'need') badgeColor = 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800';
        else if (def.classification === 'want') badgeColor = 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/70 dark:text-pink-300 dark:border-pink-800';
        else if (def.classification === 'saving') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
        else if (def.classification === 'debt') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800';

        html += `
          <div class="expense-item group relative bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 rounded-xl p-3.5 sm:p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all mb-3" data-preset-id="${def.id}">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm" style="background-color: ${def.color}">
                  <i class="fa-solid ${def.icon} text-base"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">${def.name}</span>
                    <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeColor}">${def.classification}</span>
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-400 truncate mt-0.5">${def.hint}</div>
                </div>
              </div>

              <div class="flex items-center space-x-2 self-end sm:self-auto">
                <div class="relative w-40 sm:w-44">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-semibold pointer-events-none">
                    ${this.currency}
                  </span>
                  <input type="number" 
                    step="any" 
                    min="0"
                    inputmode="decimal"
                    value="${amount}" 
                    placeholder="0.00"
                    class="w-full pl-11 pr-3 py-2 text-right font-mono-numbers font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all text-sm"
                    oninput="window.budgetApp.updatePresetAmount('${def.id}', this.value)">
                </div>

                <button type="button" 
                  onclick="window.budgetApp.togglePresetActive('${def.id}', false)"
                  class="p-2 text-slate-300 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Remove this category from this month">
                  <i class="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      }
    }

    // Render Custom Items
    for (const custom of customList) {
      let badgeColor = 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/70 dark:text-pink-300 dark:border-pink-800';
      if (custom.classification === 'need') badgeColor = 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800';
      else if (custom.classification === 'debt') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800';
      else if (custom.classification === 'saving') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';

      const amountVal = custom.amount !== undefined && custom.amount !== '' ? custom.amount : '';

      html += `
        <div class="expense-item group relative bg-white dark:bg-slate-800/90 border border-indigo-100/90 dark:border-indigo-900/50 rounded-xl p-3.5 sm:p-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all mb-3" data-custom-id="${custom.id}">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div class="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm" style="background-color: ${custom.color || '#6366f1'}">
                <i class="fa-solid ${custom.icon || 'fa-receipt'} text-base"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">${custom.name}</span>
                  <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeColor}">${custom.classification}</span>
                  <span class="text-[10px] text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1 py-0.5 rounded font-medium">Custom</span>
                </div>
                <div class="text-xs text-slate-400 dark:text-slate-400 truncate mt-0.5">User-defined custom expense</div>
              </div>
            </div>

            <div class="flex items-center space-x-2 self-end sm:self-auto">
              <div class="relative w-40 sm:w-44">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-semibold pointer-events-none">
                  ${this.currency}
                </span>
                <input type="number" 
                  step="any" 
                  min="0"
                  inputmode="decimal"
                  value="${amountVal}" 
                  placeholder="0.00"
                  class="w-full pl-11 pr-3 py-2 text-right font-mono-numbers font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all text-sm"
                  oninput="window.budgetApp.updateCustomAmount('${custom.id}', this.value)">
              </div>

              <button type="button" 
                onclick="window.budgetApp.removeCustomExpense('${custom.id}')"
                class="p-2 text-slate-300 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Delete this custom expense">
                <i class="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  updatePresetAmount(presetId, val) {
    const month = this.getCurrentMonthData();
    if (!month.expenses.presets[presetId]) {
      month.expenses.presets[presetId] = { active: true, amount: '' };
    }
    month.expenses.presets[presetId].amount = val === '' ? '' : parseFloat(val);
    this.saveToStorage();
    this.recalculateAndRenderOverview();
  }

  updateCustomAmount(id, val) {
    const month = this.getCurrentMonthData();
    const item = month.expenses.custom.find(c => c.id === id);
    if (item) {
      item.amount = val === '' ? '' : parseFloat(val);
      this.saveToStorage();
      this.recalculateAndRenderOverview();
    }
  }

  recalculateAndRenderOverview() {
    const month = this.getCurrentMonthData();
    const result = this.engine.evaluate(month);

    const totalIncomeEl = document.getElementById('statTotalIncome');
    const totalExpensesEl = document.getElementById('statTotalExpenses');
    const balanceEl = document.getElementById('statBalance');
    const balanceCard = document.getElementById('balanceStatCard');
    const balanceBadge = document.getElementById('balanceBadge');
    const healthBadge = document.getElementById('healthScoreBadge');

    if (totalIncomeEl) totalIncomeEl.textContent = this.formatMoney(result.totalIncome);
    if (totalExpensesEl) totalExpensesEl.textContent = this.formatMoney(result.totalExpenses);
    if (balanceEl) balanceEl.textContent = this.formatMoney(Math.abs(result.balance));

    const expenseSubtext = document.getElementById('statExpenseSubtext');
    if (expenseSubtext) {
      if (result.totalIncome > 0) {
        expenseSubtext.textContent = `${result.expenseRate.toFixed(1)}% of income spent`;
      } else {
        expenseSubtext.textContent = `No income set`;
      }
    }

    const incomeSubtext = document.getElementById('statIncomeSubtext');
    if (incomeSubtext) {
      const count = (month.incomeList || []).length;
      incomeSubtext.textContent = `${count} income ${count === 1 ? 'stream' : 'streams'}`;
    }

    if (balanceCard && balanceBadge) {
      if (result.balance > 0) {
        balanceCard.className = 'glass-panel card-shadow rounded-2xl p-5 border-l-4 border-l-emerald-500 relative overflow-hidden';
        balanceBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300';
        balanceBadge.innerHTML = `<i class="fa-solid fa-arrow-trend-up mr-1"></i> Surplus (+${result.savingsRate.toFixed(0)}% saved)`;
        balanceEl.className = 'text-2xl sm:text-3xl font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400 mt-1';
      } else if (result.balance < 0) {
        balanceCard.className = 'glass-panel card-shadow rounded-2xl p-5 border-l-4 border-l-rose-500 relative overflow-hidden';
        balanceBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300';
        balanceBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1"></i> Deficit (Overbudget)`;
        balanceEl.className = 'text-2xl sm:text-3xl font-bold font-mono-numbers text-rose-600 dark:text-rose-400 mt-1';
      } else {
        balanceCard.className = 'glass-panel card-shadow rounded-2xl p-5 border-l-4 border-l-slate-400 relative overflow-hidden';
        balanceBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
        balanceBadge.innerHTML = `Zero Balance`;
        balanceEl.className = 'text-2xl sm:text-3xl font-bold font-mono-numbers text-slate-700 dark:text-slate-300 mt-1';
      }
    }

    if (healthBadge) {
      healthBadge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full mr-2" style="background-color: ${result.health.color}"></span>
        <span>Score: <strong>${result.health.score}/100</strong> (${result.health.label})</span>
      `;
      healthBadge.className = `inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${result.health.bgBadge} dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200`;
    }

    this.renderSuggestions(result.suggestions);
    this.render503020Rule(result.rule503020);
    this.charts.updateDonutChart('expenseDonutChart', result.allExpenses, this.currency);
    this.charts.updateFlowBarChart('cashFlowBarChart', result.totalIncome, result.totalExpenses, result.balance, this.currency);
    this.renderDonutLegend(result.allExpenses);

    // Update Mobile Advisor Notice Badge
    const mobileBadge = document.getElementById('mobileAdvisorBadge');
    if (mobileBadge) {
      if (result.suggestions && result.suggestions.length > 0) {
        mobileBadge.textContent = result.suggestions.length;
        mobileBadge.classList.remove('hidden');
      } else {
        mobileBadge.classList.add('hidden');
      }
    }
  }

  renderSuggestions(suggestions) {
    const container = document.getElementById('suggestionsContainer');
    const countBadge = document.getElementById('suggestionsCountBadge');
    if (!container) return;

    if (countBadge) {
      countBadge.textContent = `${suggestions.length} ${suggestions.length === 1 ? 'Notice' : 'Notices'}`;
    }

    if (suggestions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-400 dark:text-slate-500">
          <i class="fa-solid fa-check-double text-3xl text-emerald-400 mb-2"></i>
          <p class="text-sm font-medium">All financial metrics look balanced.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = suggestions.map(s => {
      let cardStyle = 'border-l-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-950 dark:text-sky-100 border-sky-200 dark:border-sky-800/60';
      let iconColor = 'text-sky-500 dark:text-sky-400';
      let badgeStyle = 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200';

      if (s.type === 'danger') {
        cardStyle = 'border-l-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 border-rose-200 dark:border-rose-800/60';
        iconColor = 'text-rose-500 dark:text-rose-400';
        badgeStyle = 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 font-bold';
      } else if (s.type === 'warning') {
        cardStyle = 'border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100 border-amber-200 dark:border-amber-800/60';
        iconColor = 'text-amber-500 dark:text-amber-400';
        badgeStyle = 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-semibold';
      } else if (s.type === 'success') {
        cardStyle = 'border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800/60';
        iconColor = 'text-emerald-500 dark:text-emerald-400';
        badgeStyle = 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-semibold';
      }

      return `
        <div class="p-4 rounded-xl border border-l-4 ${cardStyle} transition-all card-shadow">
          <div class="flex items-start space-x-3">
            <div class="${iconColor} text-lg shrink-0 mt-0.5">
              <i class="fa-solid ${s.icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <h4 class="font-bold text-sm text-slate-800 dark:text-slate-100">${s.title}</h4>
                <span class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeStyle}">${s.badge}</span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${s.message}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  render503020Rule(rule) {
    const needsPct = Math.min(100, Math.round(rule.needs.rate));
    const wantsPct = Math.min(100, Math.round(rule.wants.rate));
    const savingsPct = Math.min(100, Math.round(rule.savings.rate));

    const needsBar = document.getElementById('ruleNeedsBar');
    const wantsBar = document.getElementById('ruleWantsBar');
    const savingsBar = document.getElementById('ruleSavingsBar');

    const needsVal = document.getElementById('ruleNeedsVal');
    const wantsVal = document.getElementById('ruleWantsVal');
    const savingsVal = document.getElementById('ruleSavingsVal');

    if (needsBar) needsBar.style.width = `${needsPct}%`;
    if (wantsBar) wantsBar.style.width = `${wantsPct}%`;
    if (savingsBar) savingsBar.style.width = `${savingsPct}%`;

    if (needsVal) needsVal.textContent = `${needsPct}% (Ideal: ≤50%)`;
    if (wantsVal) wantsVal.textContent = `${wantsPct}% (Ideal: ≤30%)`;
    if (savingsVal) savingsVal.textContent = `${savingsPct}% (Ideal: ≥20%)`;
  }

  renderDonutLegend(items) {
    const legendContainer = document.getElementById('donutChartLegend');
    if (!legendContainer) return;

    const activeItems = items.filter(i => (i.amount || 0) > 0);
    const total = activeItems.reduce((sum, i) => sum + i.amount, 0);

    if (activeItems.length === 0) {
      legendContainer.innerHTML = `<div class="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">No expenses recorded yet.</div>`;
      return;
    }

    legendContainer.innerHTML = activeItems.map(item => {
      const pct = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
      return `
        <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-none">
          <div class="flex items-center space-x-2 truncate pr-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${item.color}"></span>
            <span class="font-medium text-slate-700 dark:text-slate-300 truncate">${item.name}</span>
          </div>
          <div class="font-mono-numbers text-slate-600 dark:text-slate-300 font-semibold shrink-0">
            ${this.formatMoney(item.amount)} <span class="text-slate-400 dark:text-slate-500 text-[10px]">(${pct}%)</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

window.BudgetCalculator = BudgetCalculator;
window.BudgetApp = BudgetApp;

document.addEventListener('DOMContentLoaded', () => {
  window.budgetApp = new BudgetApp();
});
