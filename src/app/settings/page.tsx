"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ThemeToggle } from "~/components/theme-toggle";
import { AlertCircle, Check, Disc3, LogOut, Save, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export default function SettingsPage() {
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [lastfmConnected, setLastfmConnected] = useState(false);
  const [importInProgress, setImportInProgress] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john.doe@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="johndoe" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="gap-2">
                <Save className="h-4 w-4" />
                Update Password
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all your data
                  </p>
                </div>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-muted-foreground">
                    Sign out from your account
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>Manage your theme preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme Selection</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="overflow-hidden border-2 border-primary p-0">
                    <div className="bg-background p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Disc3 className="h-5 w-5 text-primary" />
                          <span className="font-medium">nerv-dark</span>
                        </div>
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="h-20 bg-gradient-to-r from-primary/80 to-primary p-4">
                      <div className="h-4 w-20 rounded-full bg-background/20"></div>
                    </div>
                  </Card>
                  <Card className="overflow-hidden p-0">
                    <div className="bg-background p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Disc3 className="h-5 w-5 text-primary" />
                          <span className="font-medium">nerv-wave</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-20 bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] p-4">
                      <div className="h-4 w-20 rounded-full bg-background/20"></div>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>
                Customize how content is displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Animations</p>
                  <p className="text-sm text-muted-foreground">
                    Enable subtle animations throughout the app
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact View</p>
                  <p className="text-sm text-muted-foreground">
                    Show more content with less spacing
                  </p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Default Album View</p>
                  <p className="text-sm text-muted-foreground">
                    Choose default view for album listings
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 bg-accent text-accent-foreground"
                  >
                    Grid
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Music Services</CardTitle>
              <CardDescription>
                Connect your music streaming accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1DB954]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 11.9a6 6 0 0 1 6.5-5.7" />
                      <path d="M7.5 15.5a6 6 0 0 1 9.5-5" />
                      <path d="M9 18a6 6 0 0 1 7-5.4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Spotify</p>
                    <p className="text-sm text-muted-foreground">
                      {spotifyConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={spotifyConnected ? "outline" : "default"}
                  onClick={() => setSpotifyConnected(!spotifyConnected)}
                >
                  {spotifyConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d51007]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M19.5 2.9a2.6 2.6 0 0 0-3.8 0l-3.6 3.6-2.1-2V2.3l-4 4-5 5v.7l2.1 2.1" />
                      <path d="m19.5 2.9 1.6 1.6" />
                      <path d="m11.2 10.5 2.1 2.1" />
                      <path d="m14.9 14.2 2.1 2.1" />
                      <path d="m18.4 17.8 1.6 1.6" />
                      <path d="M2.3 18.4 7.3 13H8l2.1 2.1" />
                      <path d="m4.5 16.5 3 3" />
                      <path d="m7.5 13.5 3 3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Last.fm</p>
                    <p className="text-sm text-muted-foreground">
                      {lastfmConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={lastfmConnected ? "outline" : "default"}
                  onClick={() => setLastfmConnected(!lastfmConnected)}
                >
                  {lastfmConnected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sync Options</CardTitle>
              <CardDescription>
                Configure how your music data syncs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-import new listens</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically import new tracks you listen to
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sync ratings</p>
                  <p className="text-sm text-muted-foreground">
                    Sync your ratings with connected services
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Background sync</p>
                  <p className="text-sm text-muted-foreground">
                    Keep your library in sync even when not using the app
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import & Export</CardTitle>
              <CardDescription>Manage your music data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Import from Spotify</p>
                  <p className="text-sm text-muted-foreground">
                    Import your saved albums and playlists
                  </p>
                </div>
                <Button
                  onClick={() => setImportInProgress(!importInProgress)}
                  disabled={importInProgress}
                >
                  {importInProgress ? "Importing..." : "Import"}
                </Button>
              </div>
              {importInProgress && (
                <Alert className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Import in progress</AlertTitle>
                  <AlertDescription>
                    Importing 256 albums from Spotify. This may take a few
                    minutes.
                  </AlertDescription>
                </Alert>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Library</p>
                  <p className="text-sm text-muted-foreground">
                    Export your entire music library with ratings
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">CSV</Button>
                  <Button variant="outline">JSON</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Backup Data</p>
                  <p className="text-sm text-muted-foreground">
                    Create a complete backup of all your data
                  </p>
                </div>
                <Button>Create Backup</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your data and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Clear Rating History</p>
                  <p className="text-sm text-muted-foreground">
                    Remove your rating history while keeping current ratings
                  </p>
                </div>
                <Button variant="outline">Clear History</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reset All Ratings</p>
                  <p className="text-sm text-muted-foreground">
                    Reset all your album ratings to zero
                  </p>
                </div>
                <Button variant="destructive">Reset Ratings</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete All Data</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all your data from nerv-rnk
                  </p>
                </div>
                <Button variant="destructive">Delete All Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
