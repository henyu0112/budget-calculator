/**
 * Smart Budget Calculator - Interactive Chart Manager
 * Manages Chart.js instances for visual cash flow and expense distribution.
 */

class BudgetCharts {
  constructor() {
    this.donutChart = null;
    this.flowBarChart = null;
  }

  /**
   * Update or create the Expense Breakdown Donut Chart
   */
  updateDonutChart(canvasId, items, currencySymbol = '$') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Filter items with positive amount
    const activeItems = items.filter(i => (i.amount || 0) > 0);
    const total = activeItems.reduce((sum, i) => sum + i.amount, 0);

    const labels = activeItems.map(i => i.name);
    const data = activeItems.map(i => i.amount);
    const backgroundColors = activeItems.map(i => i.color || '#94a3b8');

    // If no data, show a subtle empty placeholder
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
      this.donutChart.options.plugins.tooltip.callbacks.label = (ctx) => {
        const val = ctx.parsed || 0;
        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
        return ` ${ctx.label}: ${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${pct}%)`;
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
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        animation: {
          duration: 400
        },
        plugins: {
          legend: {
            display: false // We render our custom rich interactive HTML legend
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#f8fafc',
            bodyColor: '#e2e8f0',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const val = context.parsed || 0;
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })} (${pct}%)`;
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
  updateFlowBarChart(canvasId, totalIncome, totalExpenses, balance, currencySymbol = '$') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const labels = ['Monthly Inflow', 'Monthly Outflow', balance >= 0 ? 'Net Surplus' : 'Net Deficit'];
    const data = [totalIncome, totalExpenses, Math.abs(balance)];
    const bgColors = [
      'rgba(16, 185, 129, 0.85)', // Green for Inflow
      'rgba(239, 68, 68, 0.85)',   // Red for Outflow
      balance >= 0 ? 'rgba(59, 130, 246, 0.85)' : 'rgba(225, 29, 72, 0.85)' // Blue or Deep Rose
    ];

    if (this.flowBarChart) {
      this.flowBarChart.data.labels = labels;
      this.flowBarChart.data.datasets[0].data = data;
      this.flowBarChart.data.datasets[0].backgroundColor = bgColors;
      this.flowBarChart.options.plugins.tooltip.callbacks.label = (c) => {
        const val = c.parsed.y || 0;
        return ` ${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
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
          duration: 400
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const val = context.parsed.y || 0;
                return ` ${currencySymbol}${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f1f5f9'
            },
            ticks: {
              callback: (value) => `${currencySymbol}${value}`
            }
          },
          x: {
            grid: {
              display: false
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
