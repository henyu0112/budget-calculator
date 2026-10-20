/**
 * Smart Budget Calculator - Financial Intelligence Engine
 * Handles financial calculations, 50/30/20 analysis, and smart context-aware suggestions.
 */

const PRESET_CATEGORIES = [
  {
    id: 'food',
    name: 'Food & Groceries',
    icon: 'fa-utensils',
    color: '#f97316', // Orange
    classification: 'need',
    hint: 'Groceries, dining out, daily meals, coffee',
    defaultActive: true
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: 'fa-car',
    color: '#0284c7', // Sky Blue
    classification: 'need',
    hint: 'Petrol/gas, public transit, parking, toll, maintenance',
    defaultActive: true
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Leisure',
    icon: 'fa-film',
    color: '#ec4899', // Pink
    classification: 'want',
    hint: 'Movies, outings, hobbies, gaming, streaming subscriptions',
    defaultActive: true
  },
  {
    id: 'saving',
    name: 'Savings & Investments',
    icon: 'fa-piggy-bank',
    color: '#10b981', // Emerald
    classification: 'saving',
    hint: 'Emergency fund, fixed deposits, stocks, retirement',
    defaultActive: true
  },
  {
    id: 'rental',
    name: 'Rental / Housing',
    icon: 'fa-house',
    color: '#6366f1', // Indigo
    classification: 'need',
    hint: 'Monthly rent, room fee, maintenance fee',
    defaultActive: true
  },
  {
    id: 'loan',
    name: 'Loans',
    icon: 'fa-building-columns',
    color: '#e11d48', // Rose
    classification: 'debt',
    hint: 'Study loan, car loan, home loan, personal loans',
    defaultActive: true
  },
  {
    id: 'installment',
    name: 'Monthly Installments',
    icon: 'fa-credit-card',
    color: '#8b5cf6', // Purple
    classification: 'debt',
    hint: 'Phone/laptop installment, BNPL (Buy-Now-Pay-Later), credit card EMI',
    defaultActive: true
  },
  {
    id: 'utilities',
    name: 'Utilities & Bills',
    icon: 'fa-bolt',
    color: '#eab308', // Amber
    classification: 'need',
    hint: 'Electricity, water, Wi-Fi broadband, mobile plan',
    defaultActive: false
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Insurance',
    icon: 'fa-heart-pulse',
    color: '#06b6d4', // Cyan
    classification: 'need',
    hint: 'Medical insurance, prescriptions, supplements, doctor visits',
    defaultActive: false
  },
  {
    id: 'shopping',
    name: 'Shopping & Personal Care',
    icon: 'fa-bag-shopping',
    color: '#f43f5e', // Rose
    classification: 'want',
    hint: 'Clothing, skincare, haircuts, personal gadgets',
    defaultActive: false
  }
];

class BudgetEngine {
  constructor() {
    this.presetDefinitions = PRESET_CATEGORIES;
  }

  /**
   * Calculate all metrics for a given budget state
   * @param {Object} budgetData - { incomeList: [], expenses: { presets: {}, custom: [] } }
   * @returns {Object} Complete calculated metrics and feedback
   */
  evaluate(budgetData) {
    const incomeList = budgetData.incomeList || [];
    const presets = budgetData.expenses?.presets || {};
    const customList = budgetData.expenses?.custom || [];

    // Calculate total income
    const totalIncome = incomeList.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    // Calculate preset expenses
    const presetItems = [];
    let presetTotal = 0;

    for (const def of this.presetDefinitions) {
      const entry = presets[def.id];
      const isActive = entry ? entry.active : def.defaultActive;
      const amount = entry ? (parseFloat(entry.amount) || 0) : 0;

      if (isActive) {
        presetItems.push({
          id: def.id,
          name: def.name,
          icon: def.icon,
          color: def.color,
          classification: def.classification,
          amount: amount,
          isPreset: true,
          hint: def.hint
        });
        presetTotal += amount;
      }
    }

    // Calculate custom expenses
    const customItems = customList.map(item => ({
      id: item.id || 'custom_' + Math.random().toString(36).substr(2, 9),
      name: item.name || 'Custom Expense',
      icon: item.icon || 'fa-receipt',
      color: item.color || '#64748b',
      classification: item.classification || 'want',
      amount: parseFloat(item.amount) || 0,
      isPreset: false,
      hint: item.hint || 'Custom cost entry'
    }));

    const customTotal = customItems.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = presetTotal + customTotal;
    const balance = totalIncome - totalExpenses;

    // Group expenses by classification
    const allExpenses = [...presetItems, ...customItems];

    const needsExpenses = allExpenses.filter(e => e.classification === 'need');
    const wantsExpenses = allExpenses.filter(e => e.classification === 'want');
    const debtExpenses = allExpenses.filter(e => e.classification === 'debt');
    const savingExpenses = allExpenses.filter(e => e.classification === 'saving');

    const totalNeeds = needsExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalWants = wantsExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDebt = debtExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalAllocatedSavings = savingExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Effective total savings includes designated savings + any positive monthly surplus
    const unallocatedSurplus = Math.max(0, balance);
    const netSavings = totalAllocatedSavings + unallocatedSurplus;

    // Percentage of income calculations (handle 0 income safely)
    const incomeSafe = totalIncome > 0 ? totalIncome : (totalExpenses > 0 ? totalExpenses : 1);
    const expenseRate = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const needsRate = (totalNeeds / incomeSafe) * 100;
    const wantsRate = (totalWants / incomeSafe) * 100;
    const debtRate = (totalDebt / incomeSafe) * 100;
    const allocatedSavingsRate = (totalAllocatedSavings / incomeSafe) * 100;

    // 50/30/20 Rule:
    // Essentials = Needs (50% target)
    // Discretionary = Wants (30% target)
    // Financial Goals = Savings + Debt reduction (20% target)
    const rule503020 = {
      needs: {
        actual: totalNeeds + totalDebt, // Debt is a non-negotiable obligation
        rate: ((totalNeeds + totalDebt) / incomeSafe) * 100,
        targetRate: 50,
        status: ((totalNeeds + totalDebt) / incomeSafe) * 100 <= 55 ? 'good' : 'warning'
      },
      wants: {
        actual: totalWants,
        rate: wantsRate,
        targetRate: 30,
        status: wantsRate <= 30 ? 'good' : (wantsRate <= 40 ? 'warning' : 'danger')
      },
      savings: {
        actual: netSavings,
        rate: (netSavings / incomeSafe) * 100,
        targetRate: 20,
        status: (netSavings / incomeSafe) * 100 >= 20 ? 'good' : ((netSavings / incomeSafe) * 100 >= 10 ? 'warning' : 'danger')
      }
    };

    // Generate Smart Suggestions & Actionable Feedback
    const suggestions = this.generateSuggestions({
      totalIncome,
      totalExpenses,
      balance,
      allExpenses,
      totalNeeds,
      totalWants,
      totalDebt,
      totalAllocatedSavings,
      netSavings,
      incomeSafe,
      wantsRate,
      debtRate
    });

    // Determine financial health score (0 to 100)
    const health = this.calculateHealthScore({
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      wantsRate,
      debtRate
    });

    return {
      totalIncome,
      totalExpenses,
      balance,
      expenseRate,
      savingsRate,
      allocatedSavingsRate,
      presetItems,
      customItems,
      allExpenses,
      breakdown: {
        needs: totalNeeds,
        wants: totalWants,
        debt: totalDebt,
        savings: totalAllocatedSavings,
        needsRate,
        wantsRate,
        debtRate,
        allocatedSavingsRate
      },
      rule503020,
      suggestions,
      health
    };
  }

  /**
   * Generates intelligent, prioritized recommendations and comments
   */
  generateSuggestions(ctx) {
    const list = [];
    const { totalIncome, totalExpenses, balance, allExpenses, incomeSafe, debtRate } = ctx;

    // 0. If no income entered yet
    if (totalIncome === 0 && totalExpenses === 0) {
      list.push({
        type: 'info',
        icon: 'fa-lightbulb',
        title: 'Start by Entering Your Income',
        message: 'Enter your monthly salary or allowance above to unlock real-time financial insights and budget advice.',
        badge: 'Tip'
      });
      return list;
    }

    if (totalIncome === 0 && totalExpenses > 0) {
      list.push({
        type: 'danger',
        icon: 'fa-triangle-exclamation',
        title: 'No Income Specified',
        message: 'You have entered expenses totaling your outflow, but monthly income is currently zero. Please enter your monthly allowance or salary.',
        badge: 'Action Needed'
      });
      return list;
    }

    // 1. Overall Balance / Deficit Checks
    if (balance < 0) {
      const deficitPct = Math.round((Math.abs(balance) / totalIncome) * 100);
      list.push({
        type: 'danger',
        icon: 'fa-circle-exclamation',
        title: 'Budget Deficit Alert: Outflow Exceeds Inflow!',
        message: `You are overspending by ${Math.abs(balance).toFixed(2)} (${deficitPct}% over your total income) this month. You run the risk of debt or draining savings. Review non-essential expenses immediately to bring your budget back into positive cash flow.`,
        badge: 'Critical'
      });
    } else if (balance === 0) {
      list.push({
        type: 'warning',
        icon: 'fa-scale-unbalanced',
        title: 'Zero-Margin Budget',
        message: 'Every dollar is utilized, leaving zero buffer for unforeseen emergencies, price hikes, or spontaneous needs. Aim to create at least a 10% cash buffer.',
        badge: 'Caution'
      });
    } else {
      const surplusRate = Math.round((balance / totalIncome) * 100);
      if (surplusRate >= 20) {
        list.push({
          type: 'success',
          icon: 'fa-circle-check',
          title: 'Healthy Cash Flow Surplus',
          message: `Awesome financial management! You have a remaining surplus of ${balance.toFixed(2)} (${surplusRate}% of income). Consider directing this into an emergency fund or index funds.`,
          badge: 'Excellent'
        });
      }
    }

    // 2. Specific Entertainment Analysis (Direct User Request)
    const entertainmentItem = allExpenses.find(e => e.id === 'entertainment');
    if (entertainmentItem && entertainmentItem.amount > 0) {
      const entAmount = entertainmentItem.amount;
      const entPct = Math.round((entAmount / incomeSafe) * 100);

      if (entPct > 20) {
        list.push({
          type: 'danger',
          icon: 'fa-film',
          title: 'High Entertainment Spending',
          message: `Entertainment takes up ${entPct}% of your income (${entAmount.toFixed(2)}). General financial rules recommend keeping leisure and entertainment under 10-15%. We recommend reducing outings, dining, or subscription services to trim this by at least ${(entAmount * 0.3).toFixed(2)}.`,
          badge: 'Spending Alert',
          category: 'entertainment'
        });
      } else if (entPct > 12) {
        list.push({
          type: 'warning',
          icon: 'fa-film',
          title: 'Watch Your Entertainment Overhead',
          message: `Entertainment is currently ${entPct}% of your income (${entAmount.toFixed(2)}). It is nearing the upper recommended limit. Look for free weekend activities or share subscription plans to optimize.`,
          badge: 'Recommendation',
          category: 'entertainment'
        });
      } else {
        list.push({
          type: 'success',
          icon: 'fa-thumbs-up',
          title: 'Well-Controlled Entertainment',
          message: `Great job! Your entertainment spending is disciplined at ${entPct}% of income (${entAmount.toFixed(2)}), well within safe personal finance limits.`,
          badge: 'On Track',
          category: 'entertainment'
        });
      }
    }

    // 3. Food & Dining Analysis
    const foodItem = allExpenses.find(e => e.id === 'food');
    if (foodItem && foodItem.amount > 0) {
      const foodPct = Math.round((foodItem.amount / incomeSafe) * 100);
      if (foodPct > 30) {
        list.push({
          type: 'warning',
          icon: 'fa-utensils',
          title: 'High Food & Dining Costs',
          message: `Food spending accounts for ${foodPct}% of your income (${foodItem.amount.toFixed(2)}). If you order delivery or dine out often, preparing home meals 3-4 days a week could save 30-40% monthly.`,
          badge: 'Cost Saver',
          category: 'food'
        });
      }
    }

    // 4. Housing / Rental Analysis
    const rentalItem = allExpenses.find(e => e.id === 'rental');
    if (rentalItem && rentalItem.amount > 0) {
      const rentPct = Math.round((rentalItem.amount / incomeSafe) * 100);
      if (rentPct > 35) {
        list.push({
          type: 'warning',
          icon: 'fa-house',
          title: 'Rental Burden Exceeds 35%',
          message: `Housing and rent costs represent ${rentPct}% of your monthly earnings (${rentalItem.amount.toFixed(2)}). Financial planners recommend keeping rent under 30% to prevent feeling 'rent-burdened'. Ensure other fixed overheads remain low.`,
          badge: 'Housing Rule',
          category: 'rental'
        });
      }
    }

    // 5. Debt & Monthly Installments Analysis
    const loanItem = allExpenses.find(e => e.id === 'loan');
    const installmentItem = allExpenses.find(e => e.id === 'installment');
    const totalDebtAmount = (loanItem ? loanItem.amount : 0) + (installmentItem ? installmentItem.amount : 0);

    if (totalDebtAmount > 0) {
      const debtPct = Math.round((totalDebtAmount / incomeSafe) * 100);
      if (debtPct > 35) {
        list.push({
          type: 'danger',
          icon: 'fa-credit-card',
          title: 'High Debt & Installment Commitments',
          message: `Debt obligations and installment payments absorb ${debtPct}% of your monthly income (${totalDebtAmount.toFixed(2)}). Prioritize paying off high-interest balances and avoid taking on new Buy-Now-Pay-Later (BNPL) purchases.`,
          badge: 'Debt Alert',
          category: 'debt'
        });
      } else if (installmentItem && installmentItem.amount > 0 && Math.round((installmentItem.amount / incomeSafe) * 100) > 15) {
        const instPct = Math.round((installmentItem.amount / incomeSafe) * 100);
        list.push({
          type: 'warning',
          icon: 'fa-receipt',
          title: 'Elevated Monthly Installments',
          message: `Monthly gadget/retail installments take up ${instPct}% of your salary. Try paying off the smallest installment fully to immediately free up cash flow.`,
          badge: 'Cash Flow Tip',
          category: 'installment'
        });
      }
    }

    // 6. Savings & Emergency Fund Check
    const savingItem = allExpenses.find(e => e.id === 'saving');
    const designatedSavingAmount = savingItem ? savingItem.amount : 0;
    const effectiveSavingsPct = Math.round(((designatedSavingAmount + Math.max(0, balance)) / incomeSafe) * 100);

    if (effectiveSavingsPct < 10 && balance >= 0) {
      list.push({
        type: 'warning',
        icon: 'fa-piggy-bank',
        title: 'Low Savings Rate (<10%)',
        message: `You are saving only ${effectiveSavingsPct}% of your income. Aim to save at least 20% to build a solid 3-6 month emergency fund. Try the "Pay Yourself First" principle: set aside savings the day your salary arrives.`,
        badge: 'Savings Goal',
        category: 'saving'
      });
    } else if (effectiveSavingsPct >= 20) {
      list.push({
        type: 'success',
        icon: 'fa-award',
        title: 'Strong 20%+ Savings Benchmark Met',
        message: `You are putting away ${effectiveSavingsPct}% of your earnings! This sets a solid foundation for financial freedom and unexpected emergencies.`,
        badge: 'Milestone',
        category: 'saving'
      });
    }

    // 7. Custom Categories with unusually high cost (> 15% of income)
    const customExpenses = allExpenses.filter(e => !e.isPreset);
    for (const custom of customExpenses) {
      if (custom.amount > 0) {
        const pct = Math.round((custom.amount / incomeSafe) * 100);
        if (pct >= 15) {
          list.push({
            type: 'info',
            icon: 'fa-tag',
            title: `Custom Cost Notice: "${custom.name}"`,
            message: `"${custom.name}" represents ${pct}% of your income (${custom.amount.toFixed(2)}). Because this is a significant share, evaluate if this is an essential recurring cost.`,
            badge: 'Observation'
          });
        }
      }
    }

    return list;
  }

  /**
   * Calculates overall financial health score (0 to 100)
   */
  calculateHealthScore({ totalIncome, totalExpenses, balance, savingsRate, wantsRate, debtRate }) {
    if (totalIncome === 0 && totalExpenses === 0) {
      return { score: 100, label: 'Ready', color: 'emerald', text: 'Enter your monthly budget' };
    }

    let score = 70; // baseline

    // Inflow vs Outflow impact
    if (balance < 0) {
      const deficitRatio = Math.abs(balance) / totalIncome;
      score -= Math.min(50, Math.round(deficitRatio * 60));
    } else {
      score += 10;
    }

    // Savings impact
    if (savingsRate >= 20) score += 15;
    else if (savingsRate >= 10) score += 5;
    else score -= 15;

    // Wants impact
    if (wantsRate > 35) score -= 15;
    else if (wantsRate <= 25) score += 5;

    // Debt impact
    if (debtRate > 40) score -= 20;
    else if (debtRate > 30) score -= 10;

    // Clamp score 10 to 100
    score = Math.max(10, Math.min(100, Math.round(score)));

    if (score >= 85) {
      return { score, label: 'Excellent', color: '#10b981', textColor: 'text-emerald-600', bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else if (score >= 70) {
      return { score, label: 'Good', color: '#0284c7', textColor: 'text-sky-600', bgBadge: 'bg-sky-50 text-sky-700 border-sky-200' };
    } else if (score >= 50) {
      return { score, label: 'Fair / Caution', color: '#f59e0b', textColor: 'text-amber-600', bgBadge: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { score, label: 'Critical Alert', color: '#ef4444', textColor: 'text-rose-600', bgBadge: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
  }
}

// Export for browser global
window.BudgetEngine = BudgetEngine;
window.PRESET_CATEGORIES = PRESET_CATEGORIES;
