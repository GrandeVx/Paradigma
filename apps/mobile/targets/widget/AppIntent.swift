import WidgetKit
import AppIntents

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Balance Widget Configuration" }
    static var description: IntentDescription { "Configure your Balance budget widget display." }

    // Future: Add configuration options like which account to show, currency, etc.
    // For now, we'll use default settings
}
