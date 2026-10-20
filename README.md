# CashCompass - Smart Monthly Budget Planner

CashCompass is an interactive, modern web application designed to help users track monthly income, manage variable and fixed costs, visualize cash flow in real-time, and receive smart, actionable financial advice based on their spending habits.

---

## 🌟 Key Features

1. **Monthly Inflow Tracking (Salary / Allowance)**
   - Enter your primary monthly salary or allowance.
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

5. **Multi-Month Navigation & Persistence**
   - Navigate through different months with previous/next arrows or the calendar picker.
   - **Copy Last Month**: One-click to copy recurring fixed expenses from the previous month.
   - **Demo Budget**: One-click "Load Demo" button to instantly preview realistic sample data.
   - **100% Private & Local**: All data is automatically saved to your browser's `localStorage`. No data is sent to external servers.
   - **Multi-Currency Support**: Switch between `$`, `RM` (Malaysian Ringgit), `S$` (Singapore Dollar), `€`, `£`, `₹`, `¥`, and more.
   - **Print / PDF Export**: Clean, printable summary report.

---

## 🚀 How to Run the Website

You can run and view the website in either of two easy ways:

### Option A: Open directly in your browser (Zero setup)
Simply double-click `index.html` in your file explorer, or right-click `index.html` and choose **Open with > Chrome / Edge / Firefox**.

### Option B: Local Web Server (Recommended)
You can launch a local development server using Node.js or Python:

```bash
# Using Python
python -m http.server 3000

# OR using npm
npm start
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.
