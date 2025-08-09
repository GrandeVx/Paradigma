"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

export function ThemeValidation() {
  const { theme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Theme System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading theme status...</p>
        </CardContent>
      </Card>
    );
  }

  const getValidationIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-success-500" />
    ) : (
      <XCircle className="h-4 w-4 text-error-500" />
    );
  };

  const validations = [
    {
      name: "next-themes Provider",
      passed: theme !== undefined,
      description: "ThemeProvider is properly configured"
    },
    {
      name: "Theme Resolution",
      passed: resolvedTheme !== undefined,
      description: "Current theme is properly resolved"
    },
    {
      name: "System Theme Detection",
      passed: systemTheme !== undefined,
      description: "System preference is detected"
    },
    {
      name: "CSS Variables",
      passed: typeof window !== 'undefined' && 
        getComputedStyle(document.documentElement).getPropertyValue('--background').trim() !== '',
      description: "CSS custom properties are available"
    },
    {
      name: "Dark Mode Class",
      passed: typeof window !== 'undefined' &&
        (document.documentElement.classList.contains('dark') || 
         document.documentElement.classList.contains('light') ||
         resolvedTheme === 'light'),
      description: "Theme class is applied to HTML element"
    }
  ];

  const allPassed = validations.every(v => v.passed);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Theme System Validation</CardTitle>
          <Badge variant={allPassed ? "default" : "destructive"} className={allPassed ? "bg-success-500" : ""}>
            {allPassed ? "All Checks Passed" : "Issues Found"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Theme Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Current Theme</p>
            <p className="text-lg font-semibold">{theme || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Resolved Theme</p>
            <p className="text-lg font-semibold">{resolvedTheme || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">System Theme</p>
            <p className="text-lg font-semibold">{systemTheme || 'Unknown'}</p>
          </div>
        </div>

        {/* Validation Results */}
        <div className="space-y-3">
          <h4 className="font-medium">Validation Results</h4>
          {validations.map((validation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
              {getValidationIcon(validation.passed)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{validation.name}</p>
                <p className="text-xs text-muted-foreground">{validation.description}</p>
              </div>
              <Badge variant={validation.passed ? "default" : "destructive"} size="sm" className={validation.passed ? "bg-success-500" : ""}>
                {validation.passed ? "Pass" : "Fail"}
              </Badge>
            </div>
          ))}
        </div>

        {/* Additional Diagnostic Info */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-medium mb-2">Diagnostic Information</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">HTML Classes:</span> {
              typeof window !== 'undefined' 
                ? Array.from(document.documentElement.classList).join(', ') || 'None'
                : 'Not available'
            }</p>
            <p><span className="font-medium">Media Query (prefers dark):</span> {
              typeof window !== 'undefined' && window.matchMedia
                ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Yes' : 'No'
                : 'Not available'
            }</p>
          </div>
        </div>

        {!allPassed && (
          <div className="mt-4 p-4 border border-warning-500/20 bg-warning-50 dark:bg-warning-950/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-warning-600 dark:text-warning-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-warning-700 dark:text-warning-300">Theme System Issues Detected</h4>
                <p className="text-sm text-warning-600 dark:text-warning-400 mt-1">
                  Some validation checks failed. Review the failed items above and ensure the theme system is properly configured.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}