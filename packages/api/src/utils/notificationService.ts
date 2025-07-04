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