# Mobile App Bundle Analysis

## Bundle Size Overview
- **Source Code**: ~897KB (366 files)
- **Key Dependencies**: 85+ packages
- **Assets**: Previously ~1.3MB (now ~600KB after optimization)

## Large Dependencies Analysis

### Heavy Libraries (Estimated Impact):
1. **React Native Core** (~500KB)
   - react-native@0.79.4
   - react@19.0.0

2. **Animation Libraries** (~300KB)
   - react-native-reanimated@3.17.5
   - lottie-react-native@7.2.2

3. **UI Components** (~200KB)
   - @gorhom/bottom-sheet@4
   - @shopify/flash-list@1.7.6
   - react-native-collapsible-tab-view@8.0.1

4. **Authentication & Network** (~150KB)
   - @better-auth/expo@1.2.5
   - @trpc/client@10.45.2
   - @tanstack/react-query@4.32.6

5. **Expo SDK** (~400KB)
   - expo@53.0.13
   - 15+ expo-* packages

6. **Payment & Analytics** (~100KB)
   - @superwall/react-native-superwall@2.1.7

## Optimization Opportunities

### High Priority:
1. **Tree Shaking**: Ensure unused Expo modules are excluded
2. **Code Splitting**: Lazy load heavy screens/components
3. **Bundle Analysis**: Use `expo export` with `--dump-assetmap` for detailed analysis

### Medium Priority:
1. **Font Optimization**: Already implemented async loading
2. **Image Optimization**: Already reduced background.png by 73%
3. **Duplicate Dependencies**: Check for duplicate utilities

### Low Priority:
1. **Dead Code Elimination**: Remove unused imports
2. **Polyfill Optimization**: Use targeted polyfills only

## Recommendations

1. **Use Expo Dev Build**: Better tree shaking and optimization
2. **Enable Hermes**: Already enabled - good for performance
3. **Bundle Splitting**: Consider route-based code splitting
4. **Dependency Audit**: Regular cleanup of unused dependencies

## Expected Bundle Sizes:
- **Development**: ~15-20MB (with dev tools)
- **Production (iOS)**: ~8-12MB
- **Production (Android)**: ~10-15MB (includes APK overhead)

These are typical sizes for React Native apps with similar feature sets.