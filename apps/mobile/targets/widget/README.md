# Balance Budget Widget

## 📱 Overview

This iOS widget provides a quick overview of your monthly budget directly on your home screen. The widget displays your total budget, spending breakdown by categories, and remaining amount in a clean, visually appealing interface.

## 🎨 Design

The widget design matches the Figma specifications exactly:
- **Size**: Medium widget (329x155px equivalent)
- **Layout**: Clean white background with rounded corners
- **Components**: Header with budget total, multi-segment progress bar, spending statistics

### Color Palette
- **Primary Blue**: #005EFD (main amounts)
- **Secondary Gray**: #6B7280 (labels and currency)
- **Background**: White
- **Badge Background**: #EDF8FF (light blue)
- **Category Colors**: 
  - Casa (Home): #E81411 (Red)
  - Cibo (Food): #FDAD0C (Orange)
  - Trasporti (Transport): #409FF8 (Blue)
  - Svago (Entertainment): #FA6B97 (Pink)
  - Altro (Other): #7E01FB (Purple)

## 🏗 Architecture

### Data Models
- **`BudgetData`**: Main data structure containing budget information
- **`CategorySpending`**: Individual category spending data
- **`BalanceEntry`**: Timeline entry for widget updates

### Views
- **`BalanceHeaderView`**: Displays total budget and current month
- **`MultiSegmentProgressBar`**: Visual spending breakdown by category
- **`BudgetStatsView`**: Shows spent amount, percentage, and remaining budget
- **`BalanceWidgetView`**: Main container view

### Provider
- **`Provider`**: Manages widget timeline and data updates
- **Timeline**: Updates every hour with slight variations to simulate real data

## 📊 Mock Data

The widget currently uses realistic mock data:
- **Total Budget**: €1,500.00
- **Total Spent**: €1,124.00 (74.9%)
- **Remaining**: €376.00
- **Month**: "Luglio" (July)

### Categories Breakdown:
1. Casa (Home): €350.00 (23.3%)
2. Cibo (Food): €280.00 (18.7%)
3. Trasporti (Transport): €180.00 (12.0%)
4. Svago (Entertainment): €200.00 (13.3%)
5. Altro (Other): €114.00 (7.6%)

## 🔧 Configuration

The widget uses `ConfigurationAppIntent` for future customization options:
- Currently: Basic configuration without user parameters
- Future: Account selection, currency preferences, display options

## 🚀 Features

### Current Features:
- ✅ Real-time budget overview
- ✅ Multi-category spending visualization
- ✅ Percentage-based progress tracking
- ✅ Clean, accessible design
- ✅ Automatic timeline updates

### Future Enhancements:
- 🔄 Real data integration from main app
- 🎨 Multiple size variants (small, large)
- ⚙️ User configuration options
- 📊 Different view modes (weekly, daily)
- 🌐 Localization support

## 📝 Usage

1. **Add Widget**: Long press on home screen → "+" → Search "Balance"
2. **Select Size**: Choose Medium widget
3. **Placement**: Drag to desired position
4. **Updates**: Widget refreshes automatically every hour

## 🛠 Technical Details

### Timeline Policy
- **Update Frequency**: Every hour
- **Entry Count**: 5 entries generated
- **Policy**: `.atEnd` (generates new timeline when current ends)

### Performance
- **Lightweight**: Minimal memory footprint
- **Fast Updates**: Efficient SwiftUI rendering
- **Battery Friendly**: Optimized for widget lifecycle

### Compatibility
- **iOS Version**: iOS 17.0+
- **Widget Sizes**: Medium (systemMedium)
- **Family Support**: Currently medium only

## 🎯 Integration Notes

This widget is designed to eventually integrate with the main Balance app:
- **Shared Data**: Budget and spending information
- **App Links**: Deep linking to specific budget categories
- **Synchronization**: Real-time data updates from app database

## 🧪 Testing

Use Xcode Widget Gallery to preview:
1. Open widget in Xcode
2. Use live preview functionality
3. Test different timeline entries
4. Verify layout on different device sizes

### Preview Data
The widget includes comprehensive preview data for development and testing, showing realistic budget scenarios with varied spending patterns.