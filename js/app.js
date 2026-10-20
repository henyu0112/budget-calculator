/**
 * Smart Budget Calculator - Application Logic & UI Controller
 */

class BudgetApp {
  constructor() {
    this.storageKey = 'cashcompass_budget_v1';
    this.engine = new window.BudgetEngine();
    this.charts = new window.BudgetCharts();
    
    // Default current month format: YYYY-MM
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    this.currentMonthKey = `${year}-${month}`;

    this.currency = '$';
    this.currencies = [
      { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
      { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit (RM)' },
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

    this.data = this.loadFromStorage();
    this.init();
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

  /**
   * Ensure the current month has a default structure
   */
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
    if (!select) return;
    select.innerHTML = this.currencies.map(c => 
      `<option value="${c.symbol}" ${c.symbol === this.currency ? 'selected' : ''}>${c.name}</option>`
    ).join('');

    select.addEventListener('change', (e) => {
      this.currency = e.target.value;
      this.saveToStorage();
      this.renderAll();
    });
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
    // Month navigation
    document.getElementById('prevMonthBtn')?.addEventListener('click', () => this.navigateMonth(-1));
    document.getElementById('nextMonthBtn')?.addEventListener('click', () => this.navigateMonth(1));
    document.getElementById('monthPickerInput')?.addEventListener('change', (e) => {
      if (e.target.value) {
        this.currentMonthKey = e.target.value;
        this.renderMonthSelector();
        this.renderAll();
      }
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
          b.classList.remove('bg-white', 'text-slate-900', 'shadow-sm', 'font-semibold');
          b.classList.add('text-slate-500', 'hover:text-slate-700');
        });
        const target = e.currentTarget;
        target.classList.add('bg-white', 'text-slate-900', 'shadow-sm', 'font-semibold');
        target.classList.remove('text-slate-500');

        const tabType = target.getAttribute('data-tab');
        this.switchChartTab(tabType);
      });
    });

    // Print summary button
    document.getElementById('printReportBtn')?.addEventListener('click', () => {
      window.print();
    });

    // Clear all data (in settings or footer)
    document.getElementById('clearAllDataBtn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all stored budgets? This cannot be undone.')) {
        localStorage.removeItem(this.storageKey);
        this.data = {};
        this.init();
      }
    });
  }

  navigateMonth(delta) {
    const [y, m] = this.currentMonthKey.split('-').map(Number);
    const date = new Date(y, m - 1 + delta, 1);
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    this.currentMonthKey = `${newYear}-${newMonth}`;
    this.renderMonthSelector();
    this.renderAll();
  }

  loadDemoData() {
    const demoMonth = {
      incomeList: [
        { id: 'primary_salary', name: 'Monthly Salary / Allowance', amount: 4200 },
        { id: 'inc_freelance', name: 'Freelance Design', amount: 650 }
      ],
      expenses: {
        presets: {
          food: { active: true, amount: 680 },
          transport: { active: true, amount: 260 },
          entertainment: { active: true, amount: 620 }, // ~12.8%, triggers suggestions!
          saving: { active: true, amount: 950 },
          rental: { active: true, amount: 1100 },
          loan: { active: true, amount: 350 },
          installment: { active: true, amount: 180 },
          utilities: { active: true, amount: 160 },
          healthcare: { active: false, amount: 0 },
          shopping: { active: false, amount: 0 }
        },
        custom: [
          {
            id: 'custom_gym',
            name: 'Gym & Fitness Membership',
            classification: 'want',
            amount: 80,
            icon: 'fa-dumbbell',
            color: '#6366f1'
          },
          {
            id: 'custom_pet',
            name: 'Pet Care & Cat Food',
            classification: 'need',
            amount: 110,
            icon: 'fa-paw',
            color: '#14b8a6'
          }
        ]
      }
    };

    this.data[this.currentMonthKey] = demoMonth;
    this.saveToStorage();
    this.renderAll();

    // Trigger celebration confetti
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
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
    const [y, m] = this.currentMonthKey.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

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

    // Pick a thematic icon/color based on classification
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
      const currentAmount = entry ? entry.amount : '';

      return `
        <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base shadow-sm" style="background-color: ${def.color}">
              <i class="fa-solid ${def.icon}"></i>
            </div>
            <div>
              <div class="font-semibold text-slate-800 text-sm">${def.name}</div>
              <div class="text-xs text-slate-400 capitalize">${def.classification} • ${def.hint}</div>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer" ${isActive ? 'checked' : ''} onchange="window.budgetApp.togglePresetActive('${def.id}', this.checked)">
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
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

  /**
   * Render Inflow / Income Inputs
   */
  renderIncomeSection() {
    const container = document.getElementById('incomeInputsContainer');
    if (!container) return;

    const month = this.getCurrentMonthData();
    const incomeList = month.incomeList || [];

    container.innerHTML = incomeList.map((item, index) => {
      const isPrimary = index === 0;
      return `
        <div class="income-item group relative bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-sm hover:border-emerald-300 transition-all mb-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3 flex-1">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <i class="fa-solid fa-wallet text-base"></i>
              </div>
              <div class="flex-1 min-w-0">
                ${isPrimary 
                  ? `<div class="font-semibold text-slate-800 text-sm truncate">${item.name}</div>
                     <div class="text-xs text-slate-400">Primary take-home allowance or salary</div>`
                  : `<input type="text" value="${item.name}" 
                      placeholder="Income source title"
                      class="font-semibold text-slate-800 text-sm w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 py-0.5" 
                      onchange="window.budgetApp.updateIncomeName('${item.id}', this.value)">`
                }
              </div>
            </div>

            <div class="flex items-center space-x-2 self-end sm:self-auto">
              <div class="relative w-40 sm:w-44">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold pointer-events-none">
                  ${this.currency}
                </span>
                <input type="number" 
                  step="any" 
                  min="0"
                  value="${item.amount !== undefined && item.amount !== '' ? item.amount : ''}" 
                  placeholder="0.00"
                  class="w-full pl-9 pr-3 py-2 text-right font-mono-numbers font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm"
                  oninput="window.budgetApp.updateIncomeAmount('${item.id}', this.value)">
              </div>

              ${!isPrimary ? `
                <button type="button" 
                  onclick="window.budgetApp.removeIncomeStream('${item.id}')"
                  class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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

  /**
   * Render Outflow / Expense Inputs
   */
  renderExpensesSection() {
    const container = document.getElementById('expenseInputsContainer');
    if (!container) return;

    const month = this.getCurrentMonthData();
    const presets = month.expenses?.presets || {};
    const customList = month.expenses?.custom || [];

    let html = '';

    // Render Preset Items that are active
    for (const def of this.engine.presetDefinitions) {
      const entry = presets[def.id];
      const isActive = entry ? entry.active : def.defaultActive;
      const amount = entry && entry.amount !== undefined && entry.amount !== '' ? entry.amount : '';

      if (isActive) {
        // Tag badge for classification
        let badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
        if (def.classification === 'need') badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
        else if (def.classification === 'want') badgeColor = 'bg-pink-50 text-pink-700 border-pink-200';
        else if (def.classification === 'saving') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        else if (def.classification === 'debt') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';

        html += `
          <div class="expense-item group relative bg-white border border-slate-200/90 rounded-xl p-3.5 sm:p-4 shadow-sm hover:border-indigo-300 transition-all mb-3" data-preset-id="${def.id}">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm" style="background-color: ${def.color}">
                  <i class="fa-solid ${def.icon} text-base"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center space-x-2">
                    <span class="font-semibold text-slate-800 text-sm truncate">${def.name}</span>
                    <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeColor}">${def.classification}</span>
                  </div>
                  <div class="text-xs text-slate-400 truncate mt-0.5">${def.hint}</div>
                </div>
              </div>

              <div class="flex items-center space-x-2 self-end sm:self-auto">
                <div class="relative w-40 sm:w-44">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold pointer-events-none">
                    ${this.currency}
                  </span>
                  <input type="number" 
                    step="any" 
                    min="0"
                    value="${amount}" 
                    placeholder="0.00"
                    class="w-full pl-9 pr-3 py-2 text-right font-mono-numbers font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                    oninput="window.budgetApp.updatePresetAmount('${def.id}', this.value)">
                </div>

                <button type="button" 
                  onclick="window.budgetApp.togglePresetActive('${def.id}', false)"
                  class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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
      let badgeColor = 'bg-pink-50 text-pink-700 border-pink-200';
      if (custom.classification === 'need') badgeColor = 'bg-sky-50 text-sky-700 border-sky-200';
      else if (custom.classification === 'debt') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
      else if (custom.classification === 'saving') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';

      const amountVal = custom.amount !== undefined && custom.amount !== '' ? custom.amount : '';

      html += `
        <div class="expense-item group relative bg-white border border-indigo-100/90 rounded-xl p-3.5 sm:p-4 shadow-sm hover:border-indigo-300 transition-all mb-3" data-custom-id="${custom.id}">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div class="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm" style="background-color: ${custom.color || '#6366f1'}">
                <i class="fa-solid ${custom.icon || 'fa-receipt'} text-base"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                  <span class="font-semibold text-slate-800 text-sm truncate">${custom.name}</span>
                  <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeColor}">${custom.classification}</span>
                  <span class="text-[10px] text-indigo-500 bg-indigo-50 px-1 py-0.5 rounded font-medium">Custom</span>
                </div>
                <div class="text-xs text-slate-400 truncate mt-0.5">User-defined custom expense</div>
              </div>
            </div>

            <div class="flex items-center space-x-2 self-end sm:self-auto">
              <div class="relative w-40 sm:w-44">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-semibold pointer-events-none">
                  ${this.currency}
                </span>
                <input type="number" 
                  step="any" 
                  min="0"
                  value="${amountVal}" 
                  placeholder="0.00"
                  class="w-full pl-9 pr-3 py-2 text-right font-mono-numbers font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                  oninput="window.budgetApp.updateCustomAmount('${custom.id}', this.value)">
              </div>

              <button type="button" 
                onclick="window.budgetApp.removeCustomExpense('${custom.id}')"
                class="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
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

  /**
   * Recalculate metrics, update cards, advice, charts, and 50/30/20 bars
   */
  recalculateAndRenderOverview() {
    const month = this.getCurrentMonthData();
    const result = this.engine.evaluate(month);

    // Update Overview Cards
    const totalIncomeEl = document.getElementById('statTotalIncome');
    const totalExpensesEl = document.getElementById('statTotalExpenses');
    const balanceEl = document.getElementById('statBalance');
    const balanceCard = document.getElementById('balanceStatCard');
    const balanceBadge = document.getElementById('balanceBadge');
    const healthBadge = document.getElementById('healthScoreBadge');

    if (totalIncomeEl) totalIncomeEl.textContent = this.formatMoney(result.totalIncome);
    if (totalExpensesEl) totalExpensesEl.textContent = this.formatMoney(result.totalExpenses);
    if (balanceEl) balanceEl.textContent = this.formatMoney(Math.abs(result.balance));

    // Expense rate subtext
    const expenseSubtext = document.getElementById('statExpenseSubtext');
    if (expenseSubtext) {
      if (result.totalIncome > 0) {
        expenseSubtext.textContent = `${result.expenseRate.toFixed(1)}% of income spent`;
      } else {
        expenseSubtext.textContent = `No income set`;
      }
    }

    // Inflow subtext
    const incomeSubtext = document.getElementById('statIncomeSubtext');
    if (incomeSubtext) {
      const count = (month.incomeList || []).length;
      incomeSubtext.textContent = `${count} income ${count === 1 ? 'stream' : 'streams'}`;
    }

    // Balance status styling
    if (balanceCard && balanceBadge) {
      if (result.balance > 0) {
        balanceCard.className = 'glass-panel card-shadow rounded-2xl p-5 border-l-4 border-l-emerald-500 relative overflow-hidden';
        balanceBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800';
        balanceBadge.innerHTML = `<i class="fa-solid fa-arrow-trend-up mr-1"></i> Surplus (+${result.savingsRate.toFixed(0)}% saved)`;
        balanceEl.className = 'text-2xl sm:text-3xl font-bold font-mono-numbers text-emerald-600 mt-1';
      } else if (result.balance < 0) {
        balanceCard.className = 'glass-panel card-shadow rounded-2xl p-5 border-l-4 border-l-rose-500 relative overflow-hidden';
        balanceBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800';
        balanceBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation mr-1"></i> Deficit (Overbudget)`;
        balanceEl.className = 'text-2xl sm:text-3xl font-bold font-mono-numbers text-rose-600 mt-1';
      } else {
        balanceCard.className = 'glass-panel card-shadow rounded-2xl p-5 border-l-4 border-l-slate-400 relative overflow-hidden';
        balanceBadge.className = 'text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700';
        balanceBadge.innerHTML = `Zero Balance`;
        balanceEl.className = 'text-2xl sm:text-3xl font-bold font-mono-numbers text-slate-700 mt-1';
      }
    }

    // Financial Health Badge
    if (healthBadge) {
      healthBadge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full mr-2" style="background-color: ${result.health.color}"></span>
        <span>Score: <strong>${result.health.score}/100</strong> (${result.health.label})</span>
      `;
      healthBadge.className = `inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border ${result.health.bgBadge}`;
    }

    // Render Smart Suggestions / Feedback list
    this.renderSuggestions(result.suggestions);

    // Update 50/30/20 Rule Bars
    this.render503020Rule(result.rule503020);

    // Update Charts
    this.charts.updateDonutChart('expenseDonutChart', result.allExpenses, this.currency);
    this.charts.updateFlowBarChart('cashFlowBarChart', result.totalIncome, result.totalExpenses, result.balance, this.currency);
    this.renderDonutLegend(result.allExpenses);
  }

  /**
   * Render Smart Financial Advisor Suggestions
   */
  renderSuggestions(suggestions) {
    const container = document.getElementById('suggestionsContainer');
    const countBadge = document.getElementById('suggestionsCountBadge');
    if (!container) return;

    if (countBadge) {
      countBadge.textContent = `${suggestions.length} ${suggestions.length === 1 ? 'Notice' : 'Notices'}`;
    }

    if (suggestions.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-400">
          <i class="fa-solid fa-check-double text-3xl text-emerald-400 mb-2"></i>
          <p class="text-sm font-medium">All financial metrics look balanced.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = suggestions.map(s => {
      let cardStyle = 'border-l-sky-500 bg-sky-50/40 text-sky-950 border-sky-200';
      let iconColor = 'text-sky-500';
      let badgeStyle = 'bg-sky-100 text-sky-800';

      if (s.type === 'danger') {
        cardStyle = 'border-l-rose-500 bg-rose-50/50 text-rose-950 border-rose-200';
        iconColor = 'text-rose-500';
        badgeStyle = 'bg-rose-100 text-rose-800 font-bold';
      } else if (s.type === 'warning') {
        cardStyle = 'border-l-amber-500 bg-amber-50/50 text-amber-950 border-amber-200';
        iconColor = 'text-amber-500';
        badgeStyle = 'bg-amber-100 text-amber-800 font-semibold';
      } else if (s.type === 'success') {
        cardStyle = 'border-l-emerald-500 bg-emerald-50/50 text-emerald-950 border-emerald-200';
        iconColor = 'text-emerald-500';
        badgeStyle = 'bg-emerald-100 text-emerald-800 font-semibold';
      }

      return `
        <div class="p-4 rounded-xl border border-l-4 ${cardStyle} transition-all card-shadow">
          <div class="flex items-start space-x-3">
            <div class="${iconColor} text-lg shrink-0 mt-0.5">
              <i class="fa-solid ${s.icon}"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2 mb-1">
                <h4 class="font-bold text-sm text-slate-800">${s.title}</h4>
                <span class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeStyle}">${s.badge}</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">${s.message}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render 50/30/20 Rule visual bars
   */
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

  /**
   * Render Custom HTML Legend for the Donut Chart
   */
  renderDonutLegend(items) {
    const legendContainer = document.getElementById('donutChartLegend');
    if (!legendContainer) return;

    const activeItems = items.filter(i => (i.amount || 0) > 0);
    const total = activeItems.reduce((sum, i) => sum + i.amount, 0);

    if (activeItems.length === 0) {
      legendContainer.innerHTML = `<div class="text-xs text-slate-400 py-3 text-center">No expenses recorded yet.</div>`;
      return;
    }

    legendContainer.innerHTML = activeItems.map(item => {
      const pct = total > 0 ? ((item.amount / total) * 100).toFixed(1) : 0;
      return `
        <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none">
          <div class="flex items-center space-x-2 truncate pr-2">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${item.color}"></span>
            <span class="font-medium text-slate-700 truncate">${item.name}</span>
          </div>
          <div class="font-mono-numbers text-slate-600 font-semibold shrink-0">
            ${this.formatMoney(item.amount)} <span class="text-slate-400 text-[10px]">(${pct}%)</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.budgetApp = new BudgetApp();
});
