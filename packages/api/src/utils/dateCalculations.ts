

/**
 * Calculates the next occurrence date for a recurring rule
 * @param currentDate The current reference date
 * @param frequencyType The frequency type (DAILY, WEEKLY, MONTHLY, YEARLY)
 * @param frequencyInterval The interval multiplier 
 * @param dayOfMonth Optional specific day of month for monthly occurrences
 * @param dayOfWeek Optional specific day of week for weekly occurrences (0 = Sunday, 6 = Saturday)
 * @returns Date object representing the next occurrence
 */
export function calculateNextOccurrenceDate(
  currentDate: Date,
  frequencyType: string,
  frequencyInterval: number = 1,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null
): Date {
  // Create a copy of the date to avoid modifying the original
  const nextDate = new Date(currentDate);
  
  switch (frequencyType) {
    case "DAILY":
      nextDate.setDate(nextDate.getDate() + frequencyInterval);
      break;
      
    case "WEEKLY":
      if (dayOfWeek !== undefined && dayOfWeek !== null) {
        // Set to specific day of week
        const currentDayOfWeek = nextDate.getDay();
        let daysToAdd = (dayOfWeek - currentDayOfWeek + 7) % 7;
        
        // If we're already on the target day, move to next week
        if (daysToAdd === 0) {
          daysToAdd = 7;
        }
        
        // Add additional weeks based on interval
        daysToAdd += (frequencyInterval - 1) * 7;
        
        nextDate.setDate(nextDate.getDate() + daysToAdd);
      } else {
        // Simply add weeks based on interval
        nextDate.setDate(nextDate.getDate() + (frequencyInterval * 7));
      }
      break;
      
    case "MONTHLY":
      if (dayOfMonth !== undefined && dayOfMonth !== null) {
        // Move to next month(s) and set specific day
        nextDate.setMonth(nextDate.getMonth() + frequencyInterval);
        
        // Handle month length differences (e.g., 31st in months with fewer days)
        const originalDay = dayOfMonth;
        const monthLength = getLastDayOfMonth(nextDate.getFullYear(), nextDate.getMonth());
        
        nextDate.setDate(Math.min(originalDay, monthLength));
      } else {
        // Preserve the day of month when adding months
        const currentDay = nextDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + frequencyInterval);
        
        // Handle month length differences
        const monthLength = getLastDayOfMonth(nextDate.getFullYear(), nextDate.getMonth());
        if (currentDay > monthLength) {
          nextDate.setDate(monthLength);
        }
      }
      break;
      
    case "YEARLY":
      nextDate.setFullYear(nextDate.getFullYear() + frequencyInterval);
      break;
  }
  
  return nextDate;
}

/**
 * Gets the last day of a specific month
 * @param year The year
 * @param month The month (0-11)
 * @returns The last day of the month (28-31)
 */
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Converts a frequency in days to a FrequencyType and interval
 * @param frequencyDays Number of days between occurrences
 * @returns Object with frequencyType and frequencyInterval
 */
export function convertDaysToFrequency(frequencyDays: number): {
  frequencyType: string,
  frequencyInterval: number
} {
  // Standard mappings for common frequencies
  if (frequencyDays === 1) {
    return { frequencyType: "DAILY", frequencyInterval: 1 };
  } else if (frequencyDays === 7) {
    return { frequencyType: "WEEKLY", frequencyInterval: 1 };
  } else if (frequencyDays === 14) {
    return { frequencyType: "WEEKLY", frequencyInterval: 2 };
  } else if (frequencyDays === 30 || frequencyDays === 31) {
    return { frequencyType: "MONTHLY", frequencyInterval: 1 };
  } else if (frequencyDays === 60 || frequencyDays === 61) {
    return { frequencyType: "MONTHLY", frequencyInterval: 2 };
  } else if (frequencyDays === 90 || frequencyDays === 91) {
    return { frequencyType: "MONTHLY", frequencyInterval: 3 };
  } else if (frequencyDays === 180 || frequencyDays === 183) {
    return { frequencyType: "MONTHLY", frequencyInterval: 6 };
  } else if (frequencyDays === 365 || frequencyDays === 366) {
    return { frequencyType: "YEARLY", frequencyInterval: 1 };
  } else if (frequencyDays % 365 === 0) {
    // Multi-year periods
    return { frequencyType: "YEARLY", frequencyInterval: frequencyDays / 365 };
  } else if (frequencyDays % 30 === 0) {
    // Multi-month periods
    return { frequencyType: "MONTHLY", frequencyInterval: frequencyDays / 30 };
  } else if (frequencyDays % 7 === 0) {
    // Multi-week periods
    return { frequencyType: "WEEKLY", frequencyInterval: frequencyDays / 7 };
  } else {
    // Default to daily for any other value
    return { frequencyType: "DAILY", frequencyInterval: frequencyDays };
  }
}

/**
 * Generates a transaction group ID for linking related transactions
 * @returns A unique transaction group ID
 */
export function generateTransactionGroupId(): string {
  return `tgroup-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
} 