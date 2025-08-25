import React, { useCallback, useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { SvgIcon } from '@/components/ui/svg-icon';
import { SearchBarProps } from './types';

export function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = "Search communities", 
  onClear 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleClear = useCallback(() => {
    onChangeText('');
    if (onClear) {
      onClear();
    }
  }, [onChangeText, onClear]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <View className="px-4 py-2 bg-white dark:bg-black">
      <View className={`flex-row items-center rounded-full px-4 py-2.5 ${
        isFocused 
          ? 'bg-white dark:bg-black border border-blue-500 dark:border-blue-400' 
          : 'bg-gray-100 dark:bg-gray-900 border border-transparent'
      }`}>
        <SvgIcon 
          name="at" 
          width={18} 
          height={18} 
          color={isFocused ? "#1DA1F2" : "#6B7280"} 
        />
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          className="flex-1 ml-3 text-base text-black dark:text-white"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor="#1DA1F2"
        />
        
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            className="p-1.5 ml-2 bg-gray-200 dark:bg-gray-700 rounded-full"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <SvgIcon 
              name="close" 
              width={12} 
              height={12} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}