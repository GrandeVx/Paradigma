import { Expo, ExpoPushMessage } from "expo-server-sdk";

let expo: Expo;

// Initialize Expo SDK
function getExpoClient(): Expo {
  if (!expo) {
    expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
    });
  }
  return expo;
}

export async function sendBatchNotification(
  pushToken: string,
  transactionCount: number,
  language: string = "en"
): Promise<boolean> {
  const expoClient = getExpoClient();

  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Invalid push token: ${pushToken}`);
    return false;
  }

  const message = getBatchNotificationMessage(transactionCount, language);

  const pushMessage: ExpoPushMessage = {
    to: pushToken,
    sound: "default",
    title: message.title,
    body: message.body,
    data: {
      type: "recurring_transactions",
      count: transactionCount,
      timestamp: new Date().toISOString(),
    },
    badge: transactionCount,
  };

  try {
    const chunks = expoClient.chunkPushNotifications([pushMessage]);
    
    for (const chunk of chunks) {
      const ticketChunk = await expoClient.sendPushNotificationsAsync(chunk);
      
      // Check for errors
      for (const ticket of ticketChunk) {
        if (ticket.status === "error") {
          console.error(`Push notification error: ${ticket.message}`);
          return false;
        }
      }
    }

    console.log(`Successfully sent notification to ${pushToken} for ${transactionCount} transactions`);
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}

function getBatchNotificationMessage(count: number, language: string): { title: string; body: string } {
  const messages = {
    en: {
      title: "New Recurring Transactions",
      body: count === 1 
        ? "You have 1 new recurring transaction"
        : `You have ${count} new recurring transactions`,
    },
    it: {
      title: "Nuove Transazioni Ricorrenti",
      body: count === 1
        ? "Hai 1 nuova transazione ricorrente"
        : `Hai ${count} nuove transazioni ricorrenti`,
    },
  };

  return messages[language as keyof typeof messages] || messages.en;
}

export async function clearNotificationBadge(pushToken: string): Promise<boolean> {
  const expoClient = getExpoClient();

  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Invalid push token: ${pushToken}`);
    return false;
  }

  const clearMessage: ExpoPushMessage = {
    to: pushToken,
    badge: 0, // Reset badge to 0
    data: {
      type: "badge_clear",
      timestamp: new Date().toISOString(),
    },
  };

  try {
    const chunks = expoClient.chunkPushNotifications([clearMessage]);
    
    for (const chunk of chunks) {
      const ticketChunk = await expoClient.sendPushNotificationsAsync(chunk);
      
      // Check for errors
      for (const ticket of ticketChunk) {
        if (ticket.status === "error") {
          console.error(`Push notification error: ${ticket.message}`);
          return false;
        }
      }
    }

    console.log(`Successfully cleared badge for ${pushToken}`);
    return true;
  } catch (error) {
    console.error("Error clearing notification badge:", error);
    return false;
  }
}