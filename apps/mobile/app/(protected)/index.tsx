import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { api } from "@/lib/api";
import HeaderContainer from "@/components/layouts/_header";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui";

export default function Home() {
  const router = useRouter();
  const { data, isLoading, error } = api.util.healthCheck.useQuery();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <View className="animate-spin">
          <FontAwesome5 name="spinner" size={24} color="black" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500 bg-red-500">API Status : NOT OK</Text>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <HeaderContainer variant="secondary">
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-primary-500 text-xl font-bold">Tab One</Text>
        <Text className="text-green-500">API Status : OK</Text>
        <Text>Timestamp: {data?.timestamp.toDateString()}</Text>
        <Button onPress={() => router.push("/(protected)/(creation-flow)/name")}>
          <Text>Create Account</Text>
        </Button>
        <Button onPress={() => router.push("/(protected)/(transaction-flow)/value")}>
          <Text>Create Transaction</Text>
        </Button>
      </View>
    </HeaderContainer>
  );
}
