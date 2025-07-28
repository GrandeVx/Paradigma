import WidgetKit
import SwiftUI

// MARK: - Data Models

struct CategorySpending {
    let name: String
    let amount: Double
    let color: Color
    let percentage: Double
}

struct BudgetData {
    let totalBudget: Double
    let totalSpent: Double
    let month: String
    let categories: [CategorySpending]
    
    var remainingAmount: Double {
        return totalBudget - totalSpent
    }
    
    var spentPercentage: Double {
        return (totalSpent / totalBudget) * 100
    }
    
    static func mockData() -> BudgetData {
        let categories = [
            CategorySpending(name: "Casa", amount: 350.0, color: Color(red: 0.91, green: 0.08, blue: 0.07), percentage: 23.3),
            CategorySpending(name: "Cibo", amount: 280.0, color: Color(red: 0.99, green: 0.68, blue: 0.05), percentage: 18.7),
            CategorySpending(name: "Trasporti", amount: 180.0, color: Color(red: 0.25, green: 0.62, blue: 0.97), percentage: 12.0),
            CategorySpending(name: "Svago", amount: 200.0, color: Color(red: 0.98, green: 0.42, blue: 0.59), percentage: 13.3),
            CategorySpending(name: "Altro", amount: 114.0, color: Color(red: 0.49, green: 0.00, blue: 0.98), percentage: 7.6)
        ]
        
        return BudgetData(
            totalBudget: 1500.0,
            totalSpent: 1124.0,
            month: "Luglio",
            categories: categories
        )
    }
}

struct StatsPeriod {
    let label: String
    let avgSpending: Double
    let changePercentage: Double
    let isPositive: Bool
}

struct StatsData {
    let periods: [StatsPeriod]
    
    static func mockData() -> StatsData {
        let periods = [
            StatsPeriod(label: "Oggi", avgSpending: 45.0, changePercentage: 12.0, isPositive: false),
            StatsPeriod(label: "7gg", avgSpending: 37.0, changePercentage: 8.0, isPositive: true),
            StatsPeriod(label: "30gg", avgSpending: 42.0, changePercentage: 15.0, isPositive: false),
            StatsPeriod(label: "60gg", avgSpending: 39.0, changePercentage: 5.0, isPositive: true)
        ]
        
        return StatsData(periods: periods)
    }
}

struct BalanceEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let budgetData: BudgetData
}

struct StatsEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
    let statsData: StatsData
}

// MARK: - Provider

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> BalanceEntry {
        BalanceEntry(date: Date(), configuration: ConfigurationAppIntent(), budgetData: BudgetData.mockData())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> BalanceEntry {
        BalanceEntry(date: Date(), configuration: configuration, budgetData: BudgetData.mockData())
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<BalanceEntry> {
        var entries: [BalanceEntry] = []

        // Generate timeline with slightly varying data to show dynamic updates
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            
            // Create slightly different mock data for each entry
            var mockData = BudgetData.mockData()
            
            // Simulate small spending increases over time
            let additionalSpending = Double(hourOffset) * 15.0
            let updatedCategories = mockData.categories.enumerated().map { index, category in
                let extraAmount = additionalSpending * (Double(index + 1) / 15.0)
                return CategorySpending(
                    name: category.name,
                    amount: category.amount + extraAmount,
                    color: category.color,
                    percentage: category.percentage
                )
            }
            
            let newTotalSpent = mockData.totalSpent + additionalSpending
            mockData = BudgetData(
                totalBudget: mockData.totalBudget,
                totalSpent: min(newTotalSpent, mockData.totalBudget), // Don't exceed budget
                month: mockData.month,
                categories: updatedCategories
            )
            
            let entry = BalanceEntry(date: entryDate, configuration: configuration, budgetData: mockData)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }
}

// MARK: - Color Extensions

extension Color {
    static let balancePrimary = Color(red: 0.0, green: 0.37, blue: 0.99) // #005EFD
    static let balanceSecondary = Color(red: 0.42, green: 0.45, blue: 0.50) // #6B7280
    static let balanceBackground = Color.white
    static let badgeBackground = Color(red: 0.93, green: 0.97, blue: 1.0) // #EDF8FF
    
    // Stats widget colors
    static let statsPositive = Color(red: 0.0, green: 0.7, blue: 0.0) // #00B300 (green)
    static let statsNegative = Color(red: 0.9, green: 0.0, blue: 0.0) // #E60000 (red)
    static let statsBadgeBackground = Color(red: 0.95, green: 0.95, blue: 0.95) // #F2F2F2 (light gray)
    static let statsTitle = Color.black
    static let statsAmount = Color.black
}

// MARK: - Views

struct BalanceHeaderView: View {
    let totalBudget: Double
    let month: String
    
    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 8) {
            // Left side - Budget amount
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text("€")
                    .font(.system(size: 23, weight: .regular))
                    .foregroundColor(.balanceSecondary)
                
                HStack(alignment: .firstTextBaseline, spacing: 0) {
                    Text(String(format: "%.0f", totalBudget))
                        .font(.system(size: 45, weight: .medium))
                        .foregroundColor(.balancePrimary)
                    
                    Text(",00")
                        .font(.system(size: 23, weight: .regular))
                        .foregroundColor(.balanceSecondary)
                }
            }
            
            Spacer()
            
            // Right side - Month
            Text(month)
                .font(.system(size: 23, weight: .regular))
                .foregroundColor(.balanceSecondary)
        }
    }
}

struct MultiSegmentProgressBar: View {
    let categories: [CategorySpending]
    let totalBudget: Double
    
    private var totalSpent: Double {
        categories.reduce(0) { $0 + $1.amount }
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Background bar
                RoundedRectangle(cornerRadius: 6)
                    .fill(Color.gray.opacity(0.1))
                    .frame(width: geometry.size.width, height: 12)
                
                // Progress segments
                HStack(spacing: 0) {
                    ForEach(Array(categories.enumerated()), id: \.offset) { index, category in
                        Rectangle()
                            .fill(category.color)
                            .frame(width: max(2, (category.amount / totalBudget) * geometry.size.width))
                    }
                    
                    Spacer()
                }
                .clipShape(RoundedRectangle(cornerRadius: 6))
            }
        }
        .frame(height: 12)
    }
}

struct BudgetStatsView: View {
    let totalSpent: Double
    let remainingAmount: Double
    let spentPercentage: Double
    
    var body: some View {
        HStack(alignment: .center, spacing: 4) {
            // Left side - Spent amount
            VStack(alignment: .leading, spacing: 0) {
                Text("Hai speso")
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.balanceSecondary)
                
                HStack(alignment: .center, spacing: 4) {
                    Text(String(format: "€ %.0f,00", totalSpent))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.black)
                    
                    // Percentage badge
                    HStack {
                        Text(String(format: "%.0f%%", spentPercentage))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.balancePrimary)
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.badgeBackground)
                    .clipShape(RoundedRectangle(cornerRadius: 32))
                }
            }
            
            Spacer()
            
            // Right side - Remaining amount
            VStack(alignment: .trailing, spacing: 0) {
                Text("Ti rimane")
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.balanceSecondary)
                
                Text(String(format: "€ %.0f,00", remainingAmount))
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.black)
            }
        }
    }
}

struct BalanceWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header with total budget and month
            BalanceHeaderView(
                totalBudget: entry.budgetData.totalBudget,
                month: entry.budgetData.month
            )
            
            // Progress bar and stats section
            VStack(alignment: .leading, spacing: 4) {
                // Multi-segment progress bar
                MultiSegmentProgressBar(
                    categories: entry.budgetData.categories,
                    totalBudget: entry.budgetData.totalBudget
                )
                
                // Budget statistics
                BudgetStatsView(
                    totalSpent: entry.budgetData.totalSpent,
                    remainingAmount: entry.budgetData.remainingAmount,
                    spentPercentage: entry.budgetData.spentPercentage
                )
            }
        }
        .padding(16)
        .background(Color.balanceBackground)
        .clipShape(RoundedRectangle(cornerRadius: 21.67))
    }
}

struct widget: Widget {
    let kind: String = "BalanceWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            BalanceWidgetView(entry: entry)
                .containerBackground(Color.clear, for: .widget)
        }
        .configurationDisplayName("Balance Budget")
        .description("Keep track of your monthly budget and spending at a glance.")
        .supportedFamilies([.systemMedium])
    }
}

extension ConfigurationAppIntent {
    fileprivate static var defaultConfig: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        return intent
    }
}

// MARK: - Stats Views

struct StatsHeaderView: View {
    var body: some View {
        HStack {
            Text("Le tue spese medie")
                .font(.system(size: 23, weight: .medium))
                .foregroundColor(.statsTitle)
            
            Spacer()
        }
    }
}

struct StatsRowView: View {
    let period: StatsPeriod
    
    var body: some View {
        HStack(alignment: .center, spacing: 0) {
            // Left - Period label
            Text(period.label)
                .font(.system(size: 18, weight: .regular))
                .foregroundColor(.balanceSecondary)
                .frame(width: 50, alignment: .leading)
            
            Spacer()
            
            // Right - Amount and percentage
            HStack(alignment: .center, spacing: 8) {
                Text(String(format: "€ %.0f,00", period.avgSpending))
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(.statsAmount)
                
                // Percentage change badge
                HStack(spacing: 4) {
                    Image(systemName: period.isPositive ? "arrow.up" : "arrow.down")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(period.isPositive ? .statsPositive : .statsNegative)
                    
                    Text(String(format: "%.0f%%", period.changePercentage))
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(period.isPositive ? .statsPositive : .statsNegative)
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.statsBadgeBackground)
                .clipShape(RoundedRectangle(cornerRadius: 16))
            }
        }
        .padding(.vertical, 8)
    }
}

struct StatsWidgetView: View {
    var entry: StatsProvider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Header
            StatsHeaderView()
            
            // Stats rows
            VStack(alignment: .leading, spacing: 12) {
                ForEach(Array(entry.statsData.periods.enumerated()), id: \.offset) { index, period in
                    StatsRowView(period: period)
                    
                    if index < entry.statsData.periods.count - 1 {
                        Divider()
                            .background(Color.gray.opacity(0.2))
                    }
                }
            }
            
            Spacer()
        }
        .padding(20)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 21.67))
    }
}

// MARK: - Stats Provider

struct StatsProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> StatsEntry {
        StatsEntry(date: Date(), configuration: ConfigurationAppIntent(), statsData: StatsData.mockData())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> StatsEntry {
        StatsEntry(date: Date(), configuration: configuration, statsData: StatsData.mockData())
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<StatsEntry> {
        var entries: [StatsEntry] = []

        // Generate timeline with slightly varying data
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            
            // Create slightly different mock data for each entry
            var mockData = StatsData.mockData()
            
            // Simulate small changes in spending averages
            let variance = Double(hourOffset) * 2.0
            let updatedPeriods = mockData.periods.enumerated().map { index, period in
                let adjustment = variance * (Double(index + 1) / 10.0)
                return StatsPeriod(
                    label: period.label,
                    avgSpending: period.avgSpending + adjustment,
                    changePercentage: period.changePercentage + (adjustment / 10.0),
                    isPositive: period.isPositive
                )
            }
            
            mockData = StatsData(periods: updatedPeriods)
            
            let entry = StatsEntry(date: entryDate, configuration: configuration, statsData: mockData)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }
}

struct statsWidget: Widget {
    let kind: String = "StatsWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: StatsProvider()) { entry in
            StatsWidgetView(entry: entry)
                .containerBackground(Color.clear, for: .widget)
        }
        .configurationDisplayName("Balance Stats")
        .description("Monitor your average spending across different time periods.")
        .supportedFamilies([.systemLarge])
    }
}

#Preview(as: .systemMedium) {
    widget()
} timeline: {
    BalanceEntry(date: .now, configuration: .defaultConfig, budgetData: BudgetData.mockData())
    BalanceEntry(date: Calendar.current.date(byAdding: .hour, value: 1, to: .now)!, 
                configuration: .defaultConfig, 
                budgetData: BudgetData.mockData())
}

#Preview(as: .systemLarge) {
    statsWidget()
} timeline: {
    StatsEntry(date: .now, configuration: .defaultConfig, statsData: StatsData.mockData())
    StatsEntry(date: Calendar.current.date(byAdding: .hour, value: 1, to: .now)!, 
              configuration: .defaultConfig, 
              statsData: StatsData.mockData())
}
