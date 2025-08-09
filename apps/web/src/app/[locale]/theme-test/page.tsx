"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeValidation } from "@/components/theme-validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sun, 
  Moon, 
  Star, 
  Heart, 
  MessageCircle, 
  Share2, 
  Settings, 
  User, 
  Home, 
  Search,
  Bell,
  Check,
  X,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

export default function ThemeTestPage() {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-50 w-full border-b bg-header text-header-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Home className="h-6 w-6" />
            <h1 className="text-xl font-bold">Theme System Test</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto py-8 space-y-8">
        {/* Theme Validation */}
        <ThemeValidation />

        {/* Color Palette Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Color System Overview</CardTitle>
            <CardDescription>
              Testing all color variables and their transitions between light and dark modes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Colors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Primary Colors</h3>
              <div className="flex flex-wrap gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                  <div key={shade} className="flex flex-col items-center">
                    <div 
                      className="w-16 h-16 rounded-lg border border-border"
                      style={{ backgroundColor: `var(--primary-${shade})` }}
                    />
                    <span className="text-xs mt-1">{shade}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* State Colors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">State Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-success-500 mb-2" />
                  <p className="text-sm">Success</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-error-500 mb-2" />
                  <p className="text-sm">Error</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-warning-500 mb-2" />
                  <p className="text-sm">Warning</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-info-500 mb-2" />
                  <p className="text-sm">Info</p>
                </div>
              </div>
            </div>

            {/* Category Colors */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Category Colors</h3>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-4">
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-orange-500 mb-2" />
                  <p className="text-xs">Orange</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-red-500 mb-2" />
                  <p className="text-xs">Red</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-pink-500 mb-2" />
                  <p className="text-xs">Pink</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-sky-500 mb-2" />
                  <p className="text-xs">Sky</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-purple-500 mb-2" />
                  <p className="text-xs">Purple</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-green-500 mb-2" />
                  <p className="text-xs">Green</p>
                </div>
                <div className="text-center">
                  <div className="w-full h-16 rounded-lg bg-lime-500 mb-2" />
                  <p className="text-xs">Lime</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Testing all button variants and states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Button Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Button Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Button States */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Button States</h3>
              <div className="flex flex-wrap gap-2">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button className="opacity-50">Loading</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Components Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>Testing inputs, selects, and other form elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-input">Text Input</Label>
                  <Input id="test-input" placeholder="Enter some text..." />
                </div>
                <div>
                  <Label htmlFor="test-input-error">Input with Error</Label>
                  <Input id="test-input-error" placeholder="Error state" className="border-error-500" />
                </div>
                <div>
                  <Label htmlFor="test-textarea">Textarea</Label>
                  <Textarea id="test-textarea" placeholder="Enter some longer text..." />
                </div>
              </div>

              {/* Selects and Switches */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-select">Select</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Theme</SelectItem>
                      <SelectItem value="dark">Dark Theme</SelectItem>
                      <SelectItem value="system">System Theme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="test-switch" 
                    checked={isChecked} 
                    onCheckedChange={setIsChecked}
                  />
                  <Label htmlFor="test-switch">Toggle Switch</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge and Status Components */}
        <Card>
          <CardHeader>
            <CardTitle>Badges and Status Indicators</CardTitle>
            <CardDescription>Testing different badge variants and status indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Regular Badges */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Badge Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge className="bg-success-500 text-white">Success</Badge>
                <Badge className="bg-error-500 text-white">Error</Badge>
                <Badge className="bg-warning-500 text-grey-900">Warning</Badge>
                <Badge className="bg-info-500 text-white">Info</Badge>
              </div>
            </div>

            {/* Status Dots */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Status Indicators</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success-500" />
                  <span className="text-sm">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-grey-400" />
                  <span className="text-sm">Offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-error-500" />
                  <span className="text-sm">Busy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning-500" />
                  <span className="text-sm">Away</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Variations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Regular Card</CardTitle>
              <CardDescription>Standard card styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This is a regular card with standard styling and hover effects.</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Primary Card</CardTitle>
              <CardDescription>Card with primary accent</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This card uses primary color accents for emphasis.</p>
            </CardContent>
          </Card>

          <Card className="border-success-500/20 bg-success-50 dark:bg-success-950/20">
            <CardHeader>
              <CardTitle className="text-success-700 dark:text-success-300">Success Card</CardTitle>
              <CardDescription>Card with success state</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-success-600 dark:text-success-400">This card shows a successful state or action.</p>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Components */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>Testing dialogs, tabs, and other interactive elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tabs */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Tabs Component</h3>
              <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="space-y-2 mt-4">
                  <p className="text-muted-foreground">Make changes to your account here.</p>
                </TabsContent>
                <TabsContent value="password" className="space-y-2 mt-4">
                  <p className="text-muted-foreground">Change your password here.</p>
                </TabsContent>
                <TabsContent value="settings" className="space-y-2 mt-4">
                  <p className="text-muted-foreground">Update your settings here.</p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Alert Dialog */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Alert Dialog</h3>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Show Dialog</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Avatar Component */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Avatar Component</h3>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">VT</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Components */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-success-500 bg-success-50 dark:bg-success-950/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
              <div>
                <h4 className="font-medium text-success-700 dark:text-success-300">Success</h4>
                <p className="text-sm text-success-600 dark:text-success-400">
                  Your changes have been saved successfully.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-error-500 bg-error-50 dark:bg-error-950/20">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-error-600 dark:text-error-400" />
              <div>
                <h4 className="font-medium text-error-700 dark:text-error-300">Error</h4>
                <p className="text-sm text-error-600 dark:text-error-400">
                  Something went wrong. Please try again.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-warning-500 bg-warning-50 dark:bg-warning-950/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400" />
              <div>
                <h4 className="font-medium text-warning-700 dark:text-warning-300">Warning</h4>
                <p className="text-sm text-warning-600 dark:text-warning-400">
                  Please review your settings before continuing.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-info-500 bg-info-50 dark:bg-info-950/20">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-info-600 dark:text-info-400" />
              <div>
                <h4 className="font-medium text-info-700 dark:text-info-300">Information</h4>
                <p className="text-sm text-info-600 dark:text-info-400">
                  Here's some additional information about this feature.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Typography Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Typography & Text Colors</CardTitle>
            <CardDescription>Testing text hierarchy and color variations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Heading 1</h1>
              <h2 className="text-3xl font-semibold text-foreground mb-2">Heading 2</h2>
              <h3 className="text-2xl font-medium text-foreground mb-2">Heading 3</h3>
              <h4 className="text-xl font-medium text-foreground mb-2">Heading 4</h4>
              <h5 className="text-lg font-medium text-foreground mb-2">Heading 5</h5>
              <h6 className="text-base font-medium text-foreground mb-4">Heading 6</h6>
            </div>

            <div className="space-y-2">
              <p className="text-foreground">Regular text in foreground color</p>
              <p className="text-muted-foreground">Muted text for less emphasis</p>
              <p className="text-success-500">Success colored text</p>
              <p className="text-error-500">Error colored text</p>
              <p className="text-warning-500">Warning colored text</p>
              <p className="text-info-500">Info colored text</p>
              <p className="text-primary">Primary colored text</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card className="bg-footer text-footer-foreground border-header-border">
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Theme System Validation Complete</h3>
            <p className="text-footer-foreground/80 mb-4">
              All components should seamlessly transition between light and dark modes
            </p>
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success-500" />
                <span className="text-sm">Theme Toggle Working</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success-500" />
                <span className="text-sm">Color Variables Active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success-500" />
                <span className="text-sm">Component Integration</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}