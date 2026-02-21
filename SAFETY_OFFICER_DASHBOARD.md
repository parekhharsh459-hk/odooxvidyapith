# Safety Officer Dashboard - FleetFlow

## Overview
A fully dynamic, professional Safety Officer Dashboard for monitoring driver compliance, license expirations, and safety scores in the FleetFlow logistics system.

## Features Implemented

### 1. Authentication & Authorization
- ✅ Protected route - only accessible to users with `roleKey: 'safety'`
- ✅ Automatic redirect to unauthorized page for non-safety officers
- ✅ Session management with JWT tokens

### 2. Dashboard Views

#### A. Driver Compliance Dashboard (Main Page)
**KPI Cards (Auto-updating):**
- Total Drivers
- Expired Licenses (red alert)
- Suspended Drivers
- Average Safety Score (fleet-wide)

**Filters:**
- Compliance Status: All / Valid / Expiring Soon / Expired
- Duty Status: All / On Duty / Off Duty / Suspended
- Search by driver name

**Driver Table Columns:**
- Driver Name & ID
- License Category & Number
- License Expiry Date
- Compliance Status (with color-coded badges)
- Safety Score (0-100 with risk indicator)
- Trip Completion Rate
- Current Duty Status (editable dropdown)
- Actions (Update Score button)

#### B. License Expiry Tracker
- Shows drivers with expired or expiring licenses (within 30 days)
- Color-coded timeline:
  - 🔴 Red: Expired
  - 🟠 Orange: Expiring Soon (≤30 days)
  - 🟢 Green: Valid
- Displays days until expiry
- Contact information for each driver
- Sorted by expiry date

#### C. Safety Scores View
- Card-based layout for each driver
- Visual progress bar for safety score
- Risk level indicator:
  - 80-100: Low Risk (Green)
  - 50-79: Medium Risk (Yellow)
  - Below 50: High Risk (Red)
- Trip statistics (total, completed, incidents)
- Trip completion rate
- Update score functionality

#### D. Incident Reports
- List of all incidents with details
- Severity levels: Low / Medium / High
- Status: Open / Resolved
- Incident types:
  - Minor Collision
  - Major Collision
  - Traffic Violation
  - Equipment Damage
  - Safety Protocol Breach
  - Other
- Mark incidents as resolved
- Create new incident reports

### 3. Dynamic System Rules

**License Compliance:**
- If `licenseExpiryDate < today` → Status = "Expired" (Red Badge)
- Expired drivers cannot be assigned to trips (enforced system-wide)
- Expiring soon (≤30 days) → Orange warning badge

**Driver Status Control:**
- On Duty: Available for trip assignment
- Off Duty: Not selectable in Dispatcher dropdown
- Suspended: Blocked from all trip assignments

**Safety Score System:**
- Range: 0-100
- Auto-adjusts risk level based on score
- Decreases by 5 points per incident
- Updates incident count automatically

**Real-time Updates:**
- All changes reflect immediately across the system
- KPIs recalculate automatically
- Derived state for compliance calculation
- Cross-dashboard synchronization

### 4. Modals & Interactions

**Safety Score Update Modal:**
- Slider input (0-100)
- Real-time risk level preview
- Option to mark as incident-related
- Auto-increments incident count if checked

**Incident Report Modal:**
- Driver selection dropdown
- Incident type selection
- Severity level (Low/Medium/High)
- Detailed description textarea
- Auto-generates incident ID
- Updates driver's safety score automatically

## Data Structure

### Driver Object
```javascript
{
  id: 'D1',
  name: 'Ramesh Kumar',
  licenseNumber: 'DL-01-2019-0012345',
  licenseCategory: 'Heavy Vehicle',
  licenseExpiry: '2027-08-15',
  status: 'On Duty', // On Duty | Off Duty | Suspended
  safetyScore: 92,
  tripCompletionRate: 98,
  totalTrips: 156,
  completedTrips: 153,
  incidents: 1,
  lastIncidentDate: '2025-11-10',
  phone: '+91 98765 43210',
  joinDate: '2019-03-15'
}
```

### Incident Object
```javascript
{
  id: 'INC-001',
  driverId: 'D2',
  date: '2026-01-20',
  type: 'Minor Collision',
  severity: 'Medium', // Low | Medium | High
  description: 'Rear-end collision at traffic signal',
  resolved: true
}
```

## Seeded Data

### 5 Drivers with Varied Profiles:
1. **Ramesh Kumar** - High performer (Score: 92, Valid license)
2. **Suresh Yadav** - Expired license (Score: 45, High risk)
3. **Ajay Singh** - Suspended (Score: 38, Multiple incidents)
4. **Mohan Das** - Good performer (Score: 88, Valid license)
5. **Vikram Patel** - License expiring soon (Score: 75, Medium risk)

### 3 Pre-loaded Incidents:
- Minor Collision (Resolved)
- Traffic Violation (Open)
- Equipment Damage (Resolved)

## API Endpoints

### Driver Management
- `GET /api/drivers` - Get all drivers
- `GET /api/drivers/:id` - Get specific driver
- `PUT /api/drivers/:id` - Update driver status
- `PUT /api/drivers/:id/safety-score` - Update safety score

### Incident Management
- `GET /api/incidents` - Get all incidents
- `GET /api/incidents?driverId=D1` - Get driver-specific incidents
- `POST /api/incidents` - Create new incident
- `PUT /api/incidents/:id` - Update incident (mark resolved)

## Technical Implementation

### Reusable Components
- `KpiCard` - Dashboard metrics display
- `Badge` - Status indicators with color coding
- `RiskIndicator` - Safety score visualization
- `ScoreUpdateModal` - Safety score editing
- `IncidentReportModal` - Incident creation form

### State Management
- `useState` for local component state
- Derived state for KPIs and filtered data
- Real-time data fetching with `useEffect`
- Automatic re-fetching after mutations

### Styling
- Tailwind CSS for utility-first styling
- Dark sidebar with orange accent color
- Responsive grid layouts
- Hover effects and transitions
- Color-coded status indicators

## Login Credentials

**Safety Officer Account:**
- Email: `safety@fleet.com`
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

3. **Login as Safety Officer:**
   - Use credentials above or select "Safety Officer" demo card
   - Or sign in with Google and select "Safety Officer" role

4. **Test Features:**
   - View compliance dashboard with all drivers
   - Filter by compliance status and duty status
   - Check license expiry tracker for warnings
   - Update safety scores
   - Create incident reports
   - Change driver status (On Duty/Off Duty/Suspended)
   - Mark incidents as resolved

## System Integration

### Cross-Dashboard Effects:
- **Dispatcher Dashboard**: 
  - Suspended drivers hidden from available drivers list
  - Expired license drivers blocked from trip assignment
  - Off Duty drivers not selectable

- **Fleet Manager Dashboard**:
  - Driver status changes reflect in overview
  - Safety scores visible in driver profiles
  - Incident counts tracked

### Validation Rules:
- Cannot assign trips to drivers with expired licenses
- Cannot assign trips to suspended drivers
- Safety score automatically decreases with incidents
- Compliance status auto-calculated from expiry date

## UI/UX Highlights

- **Enterprise-grade design** with professional color scheme
- **Real-time updates** without page refresh
- **Intuitive filters** for quick data access
- **Color-coded indicators** for instant status recognition
- **Responsive layout** works on all screen sizes
- **Smooth animations** and transitions
- **Clear call-to-actions** with prominent buttons
- **Accessibility-friendly** with proper contrast ratios

## Future Enhancements (Optional)

- Export compliance reports to PDF
- Email notifications for expiring licenses
- Incident trend analytics
- Driver performance history charts
- Bulk status updates
- Advanced search and sorting
- Incident photo uploads
- Integration with external license verification APIs

---

**Built with React, Vite, Tailwind CSS, and Express.js**
