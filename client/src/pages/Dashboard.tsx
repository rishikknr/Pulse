import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Activity, TrendingUp, Clock } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: targets = [] } = trpc.targets.list.useQuery();
  const { data: activeAlerts = [] } = trpc.alerts.active.useQuery();
  const [stats, setStats] = useState({
    totalTargets: 0,
    activeAlerts: 0,
    avgUptime: 0,
    healthyTargets: 0,
  });

  useEffect(() => {
    if (targets.length > 0) {
      setStats({
        totalTargets: targets.length,
        activeAlerts: activeAlerts.length,
        avgUptime: 99.5, // This would be calculated from actual data
        healthyTargets: targets.filter((t) => t.isActive).length,
      });
    }
  }, [targets, activeAlerts]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.name || "User"}. Here's your monitoring overview.
          </p>
        </div>
        <Link href="/targets">
          <Button>Add New Target</Button>
        </Link>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {activeAlerts.length} active alert{activeAlerts.length !== 1 ? "s" : ""}. Please review them immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTargets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.healthyTargets} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAlerts === 0 ? "All systems operational" : "Requires attention"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgUptime}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
            <p className="text-xs text-muted-foreground">
              Average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Targets</CardTitle>
          <CardDescription>
            Your monitored services and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {targets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No monitoring targets yet</p>
              <Link href="/targets">
                <Button>Create Your First Target</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {targets.slice(0, 5).map((target) => (
                <div
                  key={target.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{target.name}</h3>
                    <p className="text-sm text-muted-foreground">{target.url}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {target.isActive ? (
                          <span className="text-green-600">● Online</span>
                        ) : (
                          <span className="text-red-600">● Offline</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Checked 2 min ago
                      </p>
                    </div>
                    <Link href={`/targets/${target.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
