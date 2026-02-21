# Financial Analyst Dashboard - FleetFlow

## Overview
A fully dynamic, enterprise-grade Financial Analyst Dashboard for auditing fuel spend, maintenance ROI, and operational costs in the FleetFlow logistics system.

## Features Implemented

### 1. Authentication & Authorization
- ✅ Protected route - only accessible to users with `roleKey: 'finance'`
- ✅ Automatic redirect to unauthorized page for non-financial analysts
- ✅ Session management with JWT tokens

### 2. Dashboard Views

#### A. Financial Overview (Main Dashboard)
**Dynamic KPI Cards (Auto-updating):**
- Total Fuel Cost
- Total Maintenance Cost
- Total Operational Cost (Fuel + Maintenance)
- Average Cost per Vehicle

**Revenue vs Expenses:**
- Total Revenue (green card)
- Total Expenses (red card)
- Net Profit (indigo card)

**Cost Breakdown Table:**
- Per-vehicle fuel costs
- Per-vehicle maintenance costs
- Total cost per vehicle
- Revenue per vehicle

#### B. Fuel Logs
**Features:**
- Add new fuel entries
- View all fuel transactions
- Export to CSV
- Automatic cost per liter calculation

**Fuel Entry Form:**
- Vehicle selection (dropdown)
- Liters
- Cost
- Odometer reading
- Date

**Fuel Logs Table:**
- Date
- Vehicle name
- Liters consumed
- Total cost
- Cost per liter (auto-calculated)
- Odometer reading

#### C. Maintenance Cost Analysis
**Features:**
- Add new maintenance logs
- Per-vehicle maintenance summary cards
- Export to CSV
- Service type tracking

**Maintenance Entry Form:**
- Vehicle selection
- Service type (9 predefined types)
- Cost
- Odometer reading
- Date
- Notes

**Per-Vehicle Summary:**
- Total maintenance cost
- Number of services

**Maintenance Logs Table:**
- Date
- Vehicle
- Service type
- Cost
- Notes

#### D. Operational Analytics
**Vehicle Performance Metrics:**
- Fuel Efficiency (km/L)
- Total Cost
- Revenue
- Profit/Loss
- ROI percentage with color-coded badges

**Calculations:**
- Fuel Efficiency = Odometer / Total Liters
- Total Cost = Fuel Cost + Maintenance Cost
- Profit = Revenue - Total Cost
- ROI = ((Revenue - Total Cost) / Acquisition Cost) × 100

#### E. ROI Reports
**Features:**
- Sorted by ROI (highest to lowest)
- Export ROI report to CSV
- Color-coded ROI badges (green for positive, red for negative)

**ROI Table Columns:**
- Vehicle name
- Acquisition cost
- Revenue
- Total expenses
- Net profit
- ROI percentage

### 3. Financial Calculations

**System-wide Calculations:**
```javascript
Total Fuel Cost = Σ(all fuel entries)
Total Maintenance Cost = Σ(all maintenance entries)
Total Operational Cost = Fuel + Maintenance
Average Cost per Vehicle = Total Cost / Number of Vehicles

Per Vehicle:
Fuel Efficiency = Odometer Reading / Total Liters
Cost per km = Total Cost / Odometer Reading
ROI = ((Revenue - Total Cost) / Acquisition Cost) × 100
```

**Real-time Updates:**
- All KPIs recalculate automatically when new data is added
- Derived state for all financial metrics
- Cross-dashboard synchronization

### 4. Export Functionality

**CSV Export:**
- Fuel logs export
- Maintenance logs export
- ROI reports export
- Automatic file download

**Export Format:**
- Headers included
- Comma-separated values
- Quoted strings for safety
- Filename with timestamp

## Data Structure

### Enhanced Vehicle Object
```javascript
{
  id: 'V1',
  name: 'Tata Prima 4028.S',
  plate: 'MH-01-AB-1234',
  type: 'Truck',
  capacity: 25000,
  status: 'Available',
  odometer: 125400,
  region: 'Mumbai',
  acqCost: 4500000,  // Acquisition cost
  revenue: 850000     // Total revenue generated
}
```

### Fuel Log Object
```javascript
{
  id: 'F1',
  vehicleId: 'V1',
  liters: 150,
  cost: 15750,
  date: '2026-02-18',
  odometerReading: 125400,
  costPerLiter: 105  // Auto-calculated
}
```

### Maintenance Log Object
```javascript
{
  id: 'M1',
  vehicleId: 'V4',
  serviceType: 'Engine Overhaul',
  cost: 45000,
  date: '2026-02-10',
  notes: 'Complete engine rebuild',
  odometerReading: 95200
}
```

## Seeded Data

### 5 Vehicles with Financial Data:
1. **Tata Prima 4028.S** - High revenue, moderate costs
2. **Ashok Leyland 3118** - Highest revenue
3. **Force Traveller 3350** - Good ROI
4. **Mahindra Bolero Pik-Up** - High maintenance costs
5. **BharatBenz 2523R** - Negative ROI (needs attention)

### 10 Fuel Logs:
- Distributed across all vehicles
- Various dates (Jan-Feb 2026)
- Consistent cost per liter (₹105)
- Odometer readings tracked

### 7 Maintenance Logs:
- Different service types
- Costs ranging from ₹3,500 to ₹65,000
- Distributed across vehicles
- Detailed notes included

## API Endpoints

### Financial Analytics
- `GET /api/analytics/financial` - Get complete financial analytics
  - Returns summary (totals, averages)
  - Returns per-vehicle analytics (costs, ROI, efficiency)

### Fuel Management
- `GET /api/fuel` - Get all fuel logs
- `GET /api/fuel?vehicleId=V1` - Get fuel logs for specific vehicle
- `POST /api/fuel` - Create new fuel log
- `PUT /api/fuel/:id` - Update fuel log

### Maintenance Management
- `GET /api/maintenance` - Get all maintenance logs
- `GET /api/maintenance?vehicleId=V1` - Get maintenance for specific vehicle
- `POST /api/maintenance` - Create new maintenance log
- `PUT /api/maintenance/:id` - Update maintenance log

## Technical Implementation

### Reusable Components
- `KpiCard` - Financial metrics display with icons
- `Badge` - Status indicators with color coding
- `FuelModal` - Fuel entry form
- `MaintenanceModal` - Maintenance entry form
- `FinancialOverview` - Revenue vs expenses view
- `FuelLogsView` - Fuel transaction history
- `MaintenanceView` - Maintenance cost analysis
- `AnalyticsView` - Performance metrics
- `ROIView` - Return on investment reports

### State Management
- `useState` for local component state
- Derived state for all financial calculations
- Real-time data fetching with `useEffect`
- Automatic re-fetching after mutations

### Styling
- Tailwind CSS for utility-first styling
- Dark sidebar with indigo accent color
- Data-heavy tables with hover effects
- Responsive grid layouts
- Color-coded financial indicators (green/red)

### Currency Formatting
- Indian Rupee (₹) format
- Thousands separators
- No decimal places for whole amounts
- Consistent formatting across dashboard

## Login Credentials

**Financial Analyst Account:**
- Email: `finance@fleet.com`
- Password: `fleet123`

## Testing the Dashboard

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login as Financial Analyst:**
   - Use credentials above or select "Financial Analyst" demo card
   - Or sign in with Google and select "Financial Analyst" role

4. **Test Features:**
   - View financial overview with KPIs
   - Add fuel logs and see costs update
   - Add maintenance logs
   - Check operational analytics
   - View ROI reports
   - Export data to CSV

## System Integration

### Cross-Dashboard Effects:
- **Fleet Manager Dashboard**: 
  - Vehicle costs visible in overview
  - Revenue tracking integrated

- **Dispatcher Dashboard**:
  - Trip costs contribute to operational expenses
  - Vehicle availability affects revenue

- **Safety Officer Dashboard**:
  - Maintenance logs visible for compliance
  - Vehicle status updates

### Calculation Rules:
- Fuel efficiency calculated from odometer and liters
- ROI automatically calculated from revenue and costs
- Cost per liter auto-calculated on fuel entry
- All totals update in real-time

## UI/UX Highlights

- **Corporate financial design** with professional color scheme
- **Data-heavy tables** optimized for readability
- **Real-time calculations** without page refresh
- **Export functionality** for reporting
- **Color-coded indicators** for quick insights
- **Responsive layout** works on all screen sizes
- **Smooth animations** and transitions
- **Clear financial metrics** with proper formatting

## Key Financial Metrics

### Profitability Indicators:
- **Positive ROI** (Green): Vehicle is profitable
- **Negative ROI** (Red): Vehicle needs cost optimization
- **Net Profit**: Revenue minus all operational costs

### Cost Efficiency:
- **Fuel Efficiency**: km per liter
- **Cost per km**: Total cost divided by distance
- **Average Cost per Vehicle**: Fleet-wide cost distribution

### Operational Insights:
- **Maintenance Frequency**: Number of services per vehicle
- **Fuel Consumption**: Total liters and cost trends
- **Revenue Performance**: Income vs expenses

## Future Enhancements (Optional)

- Interactive charts (line, bar, pie)
- Date range filters (monthly, quarterly, custom)
- Cost trend analysis over time
- Budget vs actual comparisons
- Predictive maintenance cost forecasting
- Fuel price trend tracking
- PDF export with charts
- Email reports scheduling
- Cost alerts and notifications
- Multi-currency support

---

**Built with React, Vite, Tailwind CSS, and Express.js**
