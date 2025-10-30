import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

interface TargetDetailProps {
  id: number;
}

export default function TargetDetail({ id }: TargetDetailProps) {
  const { data: target } = trpc.targets.get.useQuery({ id });
  const { data: checks = [] } = trpc.checks.recent.useQuery({ targetId: id, hours: 24 });
  const { data: summary } = trpc.statistics.summary.useQuery({ targetId: id });
  const { data: alertRules = [] } = trpc.alertRules.listByTarget.useQuery({ targetId: id });

  if (!target) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/targets">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{target.name}</h1>
          <p className="text-muted-foreground mt-2">{target.url}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime (24h)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.uptime?.toFixed(2) || "0"}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avgResponseTime || "0"}ms</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalChecks || "0"}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.successfulChecks || "0"} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {target.isActive ? (
                <span className="text-green-600">● Online</span>
              ) : (
                <span className="text-red-600">● Offline</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checks">Recent Checks</TabsTrigger>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Protocol</p>
                  <p className="font-semibold">{target.protocol.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Method</p>
                  <p className="font-semibold">{target.method}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check Interval</p>
                  <p className="font-semibold">{target.checkInterval} seconds</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timeout</p>
                  <p className="font-semibold">{target.timeout} seconds</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Status Code</p>
                  <p className="font-semibold">{target.expectedStatusCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">
                    {target.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Checks (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              {checks.length === 0 ? (
                <p className="text-muted-foreground">No checks yet</p>
              ) : (
                <div className="space-y-2">
                  {checks.slice(0, 20).map((check) => (
                    <div
                      key={check.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">
                          {check.isSuccess ? "✓ Success" : "✗ Failed"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(check.checkedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{check.responseTime}ms</p>
                        {check.statusCode && (
                          <p className="text-sm text-muted-foreground">
                            Status: {check.statusCode}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Rules</CardTitle>
              <CardDescription>
                Rules that trigger notifications for this target
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertRules.length === 0 ? (
                <p className="text-muted-foreground">No alert rules configured</p>
              ) : (
                <div className="space-y-4">
                  {alertRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 border rounded-lg"
                    >
                      <h4 className="font-semibold">{rule.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rule.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-semibold">{rule.ruleType}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Threshold</p>
                          <p className="font-semibold">{rule.threshold}</p>
                        </div>
                      </div>
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
