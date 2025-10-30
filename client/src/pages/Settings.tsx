import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function Settings() {
  const { user, logout } = useAuth();
  const { data: notificationSettings } = trpc.notificationSettings.get.useQuery();
  const updateNotificationsMutation = trpc.notificationSettings.update.useMutation();
  const { data: auditLogs = [] } = trpc.auditLogs.list.useQuery({ limit: 50 });

  const [formData, setFormData] = useState({
    emailEnabled: true,
    slackWebhookUrl: "",
    discordWebhookUrl: "",
  });

  useEffect(() => {
    if (notificationSettings) {
      setFormData({
        emailEnabled: notificationSettings.emailEnabled ?? true,
        slackWebhookUrl: notificationSettings.slackWebhookUrl || "",
        discordWebhookUrl: notificationSettings.discordWebhookUrl || "",
      });
    }
  }, [notificationSettings]);

  const handleSaveNotifications = async () => {
    try {
      await updateNotificationsMutation.mutateAsync(formData);
      toast.success("Notification settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and notification preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input
                  type="text"
                  value={user?.role || "user"}
                  disabled
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Member Since</Label>
                <Input
                  type="text"
                  value={
                    user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : ""
                  }
                  disabled
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to logout?")) {
                    logout();
                  }
                }}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Configure how you receive alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive alerts via email
                  </p>
                </div>
                <Switch
                  id="email"
                  checked={formData.emailEnabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, emailEnabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slack">Slack Webhook URL</Label>
                <Input
                  id="slack"
                  placeholder="https://hooks.slack.com/services/..."
                  value={formData.slackWebhookUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slackWebhookUrl: e.target.value,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Get your webhook URL from Slack's Incoming Webhooks app
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord">Discord Webhook URL</Label>
                <Input
                  id="discord"
                  placeholder="https://discordapp.com/api/webhooks/..."
                  value={formData.discordWebhookUrl}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discordWebhookUrl: e.target.value,
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Create a webhook in your Discord server settings
                </p>
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={updateNotificationsMutation.isPending}
              >
                {updateNotificationsMutation.isPending
                  ? "Saving..."
                  : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Track all actions performed on your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <p className="text-muted-foreground">No audit logs yet</p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg text-sm"
                    >
                      <div>
                        <p className="font-semibold">{log.action}</p>
                        <p className="text-muted-foreground">
                          {log.entityType} {log.entityId && `#${log.entityId}`}
                        </p>
                      </div>
                      <p className="text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
