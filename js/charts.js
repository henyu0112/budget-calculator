/**
 * Budget Manager - Interactive Chart Manager
 * Manages Chart.js instances for visual cash flow and expense distribution with dark mode support.
 */

class BudgetCharts {
  constructor() {
    this.donutChart = null;
    this.flowBarChart = null;
  }

  isDarkMode() {
    return document.documentElement.classList.contains('dark');
  }

  /**
   * Update or create the Expense Breakdown Donut Chart
   */
  updateDonutChart(canvasId, items, currencySymbol = 'RM') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const isDark = this.isDarkMode();
    const activeItems = items.filter(i => (i.amount || 0) > 0);
    const total = activeItems.reduce((sum, i) => sum + i.amount, 0);

    const labels = activeItems.map(i => i.name);
    const data = activeItems.map(i => i.amount);
    const backgroundColors = activeItems.map(i => i.color || '#94a3b8');
    const borderColor = isDark ? '#0f172a' : '#ffffff';

    if (activeItems.length === 0) {
      if (this.donutChart) {
        this.donutChart.destroy();
        this.donutChart = null;
      }
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (this.donutChart) {
      this.donutChart.data.labels = labels;
      this.donutChart.data.datasets[0].data = data;
      this.donutChart.data.datasets[0].backgroundColor = backgroundColors;
      this.donutChart.data.datasets[0].borderColor = borderColor;
      this.donutChart.options.plugins.tooltip.callbacks.label = (ctx) => {
        const val = ctx.parsed || 0;
        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
        return ` ${ctx.label}: ${currencySymbol} ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${pct}%)`;
      };
      this.donutChart.update('active');
      return;
    }

    const ctx = canvas.getContext('2d');
    this.donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: borderColor,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        animation: {
          duration: 350
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            borderColor: isDark ? '#334155' : 'transparent',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const val = context.parsed || 0;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${currencySymbol} ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Update or create the Inflow vs Outflow Cash Comparison Bar Chart
   */
  updateFlowBarChart(canvasId, totalIncome, totalExpenses, balance, currencySymbol = 'RM') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const isDark = this.isDarkMode();
    const ctx = canvas.getContext('2d');
    const labels = ['Monthly Inflow', 'Monthly Outflow', balance >= 0 ? 'Net Surplus' : 'Net Deficit'];
    const data = [totalIncome, totalExpenses, Math.abs(balance)];
    const bgColors = [
      'rgba(16, 185, 129, 0.85)', // Emerald
      'rgba(239, 68, 68, 0.85)',   // Rose
      balance >= 0 ? 'rgba(99, 102, 241, 0.85)' : 'rgba(225, 29, 72, 0.85)' // Indigo or Deep Rose
    ];

    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : '#f1f5f9';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    if (this.flowBarChart) {
      this.flowBarChart.data.labels = labels;
      this.flowBarChart.data.datasets[0].data = data;
      this.flowBarChart.data.datasets[0].backgroundColor = bgColors;
      this.flowBarChart.options.scales.y.grid.color = gridColor;
      this.flowBarChart.options.scales.y.ticks.color = textColor;
      this.flowBarChart.options.scales.x.ticks.color = textColor;
      this.flowBarChart.options.plugins.tooltip.backgroundColor = isDark ? '#1e293b' : '#0f172a';
      this.flowBarChart.options.plugins.tooltip.callbacks.label = (c) => {
        const val = c.parsed.y || 0;
        return ` ${currencySymbol} ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      };
      this.flowBarChart.update('active');
      return;
    }

    this.flowBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: bgColors,
          borderRadius: 8,
          barPercentage: 0.6,
          maxBarThickness: 56
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 350
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#0f172a',
            padding: 10,
            cornerRadius: 8,
            borderColor: isDark ? '#334155' : 'transparent',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const val = context.parsed.y || 0;
                return ` ${currencySymbol} ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: gridColor
            },
            ticks: {
              color: textColor,
              callback: (value) => `${currencySymbol} ${value}`
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: textColor
            }
          }
        }
      }
    });
  }

  /**
   * Clean up all charts
   */
  destroyAll() {
    if (this.donutChart) {
      this.donutChart.destroy();
      this.donutChart = null;
    }
    if (this.flowBarChart) {
      this.flowBarChart.destroy();
      this.flowBarChart = null;
    }
  }
}

window.BudgetCharts = BudgetCharts;
