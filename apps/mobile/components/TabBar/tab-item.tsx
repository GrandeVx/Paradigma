import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

interface Props extends Omit<TouchableOpacityProps, 'children'> {
  descriptor: BottomTabBarProps['descriptors'][string];
  activeIndex: number;
  index: number;
}
export function TabItem({ descriptor, activeIndex, index, ...other }: Props) {
  const isFocused = activeIndex === index;
  const Icon =
    descriptor.options.tabBarIcon != null ? (
      descriptor.options.tabBarIcon?.({
        focused: isFocused,
        color: isFocused ? '#704f37' : '#c4c4c6',
        size: 27
      })
    ) : (

      <Ionicons name="flask" size={27} color={isFocused ? '#704f37' : '#c4c4c6'} />
    );

  return (
    <TouchableOpacity {...other} style={styles.item_container}>
      {(Icon as React.ReactNode)}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item_container: {
    width: 35,
    aspectRatio: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
