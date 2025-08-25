import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';

interface GroupsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface GroupsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class GroupsErrorBoundary extends React.Component<
  GroupsErrorBoundaryProps,
  GroupsErrorBoundaryState
> {
  constructor(props: GroupsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GroupsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Groups Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <View className="flex-1 justify-center items-center px-8 bg-white dark:bg-black">
          <View className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full items-center justify-center mb-4">
            <SvgIcon 
              name="close" 
              width={24} 
              height={24} 
              color="#EF4444" 
            />
          </View>
          
          <Text className="text-xl font-bold text-red-500 mb-2 text-center">
            Something went wrong
          </Text>
          
          <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6 max-w-xs">
            Failed to load groups. Please try again later.
          </Text>
          
          {this.state.error && __DEV__ && (
            <Text className="text-xs text-red-400 mt-4 text-center font-mono max-w-xs">
              {this.state.error.message}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}