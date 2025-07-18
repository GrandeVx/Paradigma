import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text'; // Assuming Skeleton is a loading indicator component

import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { SvgIcon } from '../ui/svg-icon';

// Ensure TransactionType is defined or imported if it's a shared type
// For now, defining it locally based on its usage in the original file.
export type TransactionType = 'income' | 'expense' | 'transfer'; // Exporting for potential reuse

interface CategoryBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  renderBackdrop: (props: BottomSheetBackdropProps) => React.ReactNode;
  handleClosePress: () => void;
  type: TransactionType;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
}

export const CategoryBottomSheet: React.FC<CategoryBottomSheetProps> = ({
  bottomSheetRef,
  snapPoints,
  renderBackdrop,
  handleClosePress,
  type,
  selectedCategoryId,
  setSelectedCategoryId,
}) => {
  const { data: categories, isLoading: isCategoriesLoading } = api.category.list.useQuery({
    type: type === "income" ? "INCOME" : "EXPENSE"
  });

  const HandleHexColorOpacity = (color: string) => {
    const rgb = color.match(/\w\w/g)?.map(hex => parseInt(hex, 16));
    if (!rgb) return color;
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)`;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} // Start closed
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleStyle={{
        backgroundColor: '#FFFFFF', // Consider theme variables
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#000", // Consider theme variables
        width: 40,
      }}
      containerStyle={{
        zIndex: 1000,
      }}
      backgroundStyle={{
        backgroundColor: "#FFFFFF" // Consider theme variables
      }}
    >
      <View className="w-full h-full pt-4 px-6">

        <View className="flex-row justify-between items-center w-full pb-4 ">
          <View className="">
            <Text className="text-black text-center font-medium uppercase" style={{ fontSize: 14 }}>
              Categoria
            </Text>
          </View>
          <SvgIcon name="close" size={12} color="black" onPress={handleClosePress} />
        </View>


        <View className="mb-4">
          {isCategoriesLoading ? (
            <View className="flex items-center justify-center h-40">
              <Text>Caricamento categorie...</Text>
            </View>
          ) : (
            categories && categories.length > 0 ? (
              <ScrollView
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 20,
                }}
              >
                {categories?.map((category) => (
                  <View key={category.id} className="flex flex-col items-center justify-center gap-2 mb-4">
                    {/* Main Category Display */}
                    <View
                      style={{ backgroundColor: HandleHexColorOpacity(category.color) || '#CCCCCC', }}
                      className="w-fit h-10 mt-4 px-4 py-2 rounded-full flex flex-row gap-4 items-center justify-center"
                    >
                      <Text className="text-white text-sm font-medium">
                        {category.icon}
                      </Text>
                      <Text className="text-black text-lg font-semibold" style={{ fontFamily: 'DM Sans', color: category.color }}>{category.name}</Text>
                    </View>
                    {/* Subcategories Display */}
                    <View className="flex flex-row flex-wrap w-full justify-center pt-2 gap-y-3 gap-x-2 px-2">
                      {
                        category.subCategories.map((subCategory) => (
                          <Pressable
                            onPress={() => {
                              setSelectedCategoryId(subCategory.id);
                              handleClosePress();
                            }}
                            key={subCategory.id}
                            className={cn(
                              "w-fit min-h-10 px-5 py-2 rounded-full flex items-center justify-center text-black border border-gray-300",
                              selectedCategoryId === subCategory.id ? "bg-gray-100" : "bg-white"
                            )}
                          >
                            <Text className="text-black text-sm font-medium text-center">{subCategory.icon} {subCategory.name}</Text>
                          </Pressable>
                        ))
                      }
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View className="flex items-center justify-center h-40">
                <Text>Nessuna categoria trovata.</Text>
              </View>
            )

          )}
        </View>
      </View>
    </BottomSheet>
  );
}; 