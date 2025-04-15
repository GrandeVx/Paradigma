import { StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
import { View } from "react-native";
import HeaderContainer from "@/components/layouts/_header";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileScreen() {
  const router = useRouter();

  const rightActions = [
    {
      icon: <FontAwesome5 name="cog" size={24} color="black" />,
      onPress: () => router.push("/(protected)/(profile)/(settings)"),
    },
  ];

  return (
    <HeaderContainer variant="main" rightActions={rightActions}>
      <View className="flex-1 bg-white">
        {/* Profile Header Section */}
        <View className="px-4 pt-6">
          <View className="items-center">
            <View className="relative">
              <View className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                <Skeleton width={96} height={96} />
              </View>
              <View className="absolute bottom-0 right-0 bg-gray-100 rounded-full p-2">
                <FontAwesome5 name="camera" size={14} color="black" />
              </View>
            </View>
            <Text className="text-2xl font-bold text-black mt-4">
              Nome Utente
            </Text>
            <Text className="text-gray-500 mt-1">@username</Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-around mt-6 pb-6 border-b border-gray-200">
            <View className="items-center">
              <Text className="text-black font-bold text-xl">0</Text>
              <Text className="text-gray-500">Allenamenti</Text>
            </View>
            <View className="items-center">
              <Text className="text-black font-bold text-xl">0</Text>
              <Text className="text-gray-500">Obiettivi</Text>
            </View>
            <View className="items-center">
              <Text className="text-black font-bold text-xl">0</Text>
              <Text className="text-gray-500">Streak</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View className="px-4 mt-6">
          <Text className="text-black text-xl font-bold mb-4">
            Attività Recenti
          </Text>
          <View className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <View key={index} className="bg-gray-50 p-4 rounded-xl">
                <View className="flex-row items-center space-x-3 gap-5">
                  <Skeleton width={40} height={40} />
                  <View className="flex-1">
                    <Skeleton width={200} height={16} />
                    <View className="h-2" />
                    <Skeleton width={150} height={12} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </HeaderContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
