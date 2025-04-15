import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { BottomTabDescriptor } from '@react-navigation/bottom-tabs/src/types';
import { Ionicons } from '@expo/vector-icons';

interface Props extends Omit<TouchableOpacityProps, 'children'> {
  descriptor: BottomTabDescriptor;
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
      {Icon}
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
