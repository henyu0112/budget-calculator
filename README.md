# Budget Manager - Your personal budget buddy and advisor

Budget Manager is a modern, responsive web application designed to help you track monthly income, manage variable and fixed costs, visualize cash flow in real-time, and receive smart, actionable financial advice based on your spending habits.

---

## 🌟 Key Features

1. **Monthly Inflow Tracking (Salary / Allowance)**
   - Enter your primary monthly salary or allowance (Default currency: **RM** / Malaysian Ringgit, switchable to `$`, `S$`, `€`, `£`, etc.).
   - Add multiple secondary income streams (freelance, bonuses, side gigs).

2. **Customizable Outflow (Costs & Expenses)**
   - **Preset Categories**: Food & Groceries, Transportation, Entertainment & Leisure, Savings & Investments, Rental / Housing, Loans, Monthly Installments (BNPL / Credit cards), Utilities & Bills, Healthcare, and Shopping.
   - **Toggle & Hide Irrelevant Categories**: Any category that does not apply to you can be removed with a single click (✕) or toggled on/off in the **Presets Manager**.
   - **Add Custom Costs**: Create any custom expense field with your own custom name, category type (Essential Need, Discretionary Want, Debt, or Savings), and amount.

3. **Inflow vs Outflow Cash Comparison**
   - **Live Balance**: Instantly calculates your Net Cash Flow (Surplus vs Deficit).
   - **Financial Health Score**: Dynamic 0-100 rating based on savings rate, debt obligations, and discretionary spending.
   - **Visual Analytics**:
     - **Expense Distribution Donut Chart**: Clear percentage breakdown for every category.
     - **Inflow vs Outflow Bar Chart**: Side-by-side comparison of total earnings, total costs, and net surplus/deficit.
     - **50/30/20 Rule Tracker**: Compares your spending against the gold-standard 50% Needs, 30% Wants, and 20% Savings benchmark.

4. **Smart Spending Feedback & Financial Advisor**
   - **Entertainment Rule**: If entertainment and leisure expenses exceed recommended levels (>12-15% of income), the system alerts you with specific suggestions to cut back on dining out, outings, or subscriptions.
   - **Rental / Housing Rule**: Warns if rent exceeds 30-35% of income.
   - **Debt & Installments Rule**: Alerts if loan and installment obligations are burdensome (>35% of income).
   - **Savings Benchmark**: Highlights whether you are meeting the 20% savings threshold or living paycheck-to-paycheck.
   - **Deficit / Overspending Warnings**: Immediate alert when monthly expenses exceed total income.

5. **🌙 Dark Mode & Night Theme**
   - One-click toggle between crisp Light Mode and eye-friendly Dark Mode.
   - Charts, cards, text, and modals adjust seamlessly for comfortable night usage.
   - Saves your theme preference automatically.

6. **Multi-Month Navigation & Persistence**
   - Smooth navigation through every month (both odd and even months) with arrow buttons, calendar picker, or mouse wheel scroll.
   - **Copy Last Month**: One-click to copy recurring fixed expenses from the previous month.
   - **Demo Budget**: One-click "Load Demo" button to instantly preview realistic sample data.
   - **100% Private & Local**: All data is automatically saved to your browser's `localStorage`. No data is sent to external servers.
   - **Print / PDF Export**: Clean, printable summary report.

---

## 🚀 How to Run the Website Locally

```bash
# Using Python
python -m http.server 3000

# OR using npm
npm start
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.
