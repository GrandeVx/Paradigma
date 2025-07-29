# Balance Stats Widget

## 📱 Overview

This iOS widget provides a comprehensive view of your average spending across different time periods. The widget displays spending statistics for "Oggi" (Today), "7gg" (7 days), "30gg" (30 days), and "60gg" (60 days) with percentage changes and trend indicators.

## 🎨 Design

The widget design follows the Large/Stats Figma specifications:
- **Size**: Large widget (329x345px equivalent)
- **Layout**: Clean white background with rounded corners
- **Components**: Header with title, individual rows for each time period with amounts and trend indicators

### Color Palette
- **Title**: Black (#000000)
- **Amount Text**: Black (#000000) 
- **Period Labels**: Secondary gray (#6B7280)
- **Positive Changes**: Green (#00B300)
- **Negative Changes**: Red (#E60000)
- **Badge Background**: Light gray (#F2F2F2)

## 🏗 Architecture

### Data Models
- **`StatsPeriod`**: Individual time period data with label, average spending, percentage change, and trend direction
- **`StatsData`**: Container for all time periods
- **`StatsEntry`**: Timeline entry for widget updates

### Views
- **`StatsHeaderView`**: Displays "Le tue spese medie" title
- **`StatsRowView`**: Individual row for each time period showing:
  - Period label (Oggi, 7gg, 30gg, 60gg)
  - Average spending amount (€ format)
  - Percentage change badge with arrow and color coding
- **`StatsWidgetView`**: Main container view with proper spacing and layout

### Provider
- **`StatsProvider`**: Manages widget timeline and data updates
- **Timeline**: Updates every hour with slight variations to simulate real data changes

## 📊 Mock Data

The widget currently uses realistic mock data:

### Time Periods:
1. **Oggi** (Today): €45.00 with -12% change (negative trend)
2. **7gg** (7 days): €37.00 with +8% change (positive trend)  
3. **30gg** (30 days): €42.00 with -15% change (negative trend)
4. **60gg** (60 days): €39.00 with +5% change (positive trend)

## 🔧 Configuration

The widget uses the same `ConfigurationAppIntent` as the budget widget for consistency:
- Currently: Basic configuration without user parameters
- Future: Time period customization, currency preferences, comparison baselines

## 🚀 Features

### Current Features:
- ✅ Multi-period spending averages display
- ✅ Trend indicators with color-coded arrows
- ✅ Percentage change calculations
- ✅ Clean, accessible design
- ✅ Automatic timeline updates
- ✅ Consistent styling with budget widget

### Future Enhancements:
- 🔄 Real data integration from main app
- 📊 Customizable time periods
- 🎯 Spending goal comparisons
- 📈 Historical trend analysis
- 🌐 Localization support
- ⚙️ Baseline comparison options

## 📝 Usage

1. **Add Widget**: Long press on home screen → "+" → Search "Balance"
2. **Select Type**: Choose "Balance Stats" 
3. **Select Size**: Choose Large widget
4. **Placement**: Drag to desired position
5. **Updates**: Widget refreshes automatically every hour

## 🛠 Technical Details

### Timeline Policy
- **Update Frequency**: Every hour
- **Entry Count**: 5 entries generated
- **Policy**: `.atEnd` (generates new timeline when current ends)
- **Data Variance**: Small adjustments to simulate real spending changes

### Layout Structure
```swift
VStack(alignment: .leading, spacing: 20) {
    StatsHeaderView()                    // Title
    VStack(spacing: 12) {               // Stats rows
        ForEach(periods) { period in
            StatsRowView(period: period)
            Divider()                   // Separator between rows
        }
    }
    Spacer()                           // Bottom spacing
}
```

### Row Layout
```swift
HStack {
    Text(period.label)                  // Period (Oggi, 7gg, etc.)
    Spacer()
    HStack {
        Text(amount)                    // € 45,00
        HStack {
            Image(arrow)                // ↑ or ↓
            Text(percentage)            // 12%
        }
        .background(badge)              // Rounded background
    }
}
```

## 🎯 Integration Notes

This stats widget complements the budget widget by providing:
- **Different Perspective**: Average spending vs current budget
- **Time Analysis**: Multiple periods vs single month
- **Trend Insights**: Change indicators vs absolute amounts
- **Behavioral Patterns**: Spending habits vs budget adherence

## 🧪 Testing

### Widget Gallery Preview
```swift
#Preview(as: .systemLarge) {
    statsWidget()
} timeline: {
    StatsEntry(date: .now, configuration: .defaultConfig, statsData: StatsData.mockData())
    // Additional timeline entries for testing
}
```

### Verification Points
- Layout spacing and alignment
- Color accuracy for trends
- Text sizing and readability
- Badge appearance and positioning
- Timeline data variations

## 📊 Data Flow

1. **Widget Load**: `StatsProvider` generates timeline entries
2. **Mock Data**: Realistic spending averages with trend indicators
3. **UI Rendering**: SwiftUI displays formatted data with proper styling
4. **Updates**: Hourly refresh with slight data variations
5. **Trends**: Positive/negative indicators based on percentage changes

This stats widget provides users with valuable insights into their spending patterns and trends across different time horizons, complementing the existing budget tracking widget.