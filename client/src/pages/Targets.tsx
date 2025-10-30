import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit2, Activity } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Targets() {
  const { data: targets = [], refetch } = trpc.targets.list.useQuery();
  const createMutation = trpc.targets.create.useMutation();
  const updateMutation = trpc.targets.update.useMutation();
  const deleteMutation = trpc.targets.delete.useMutation();
  const testMutation = trpc.targets.testCheck.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    description: "",
    protocol: "https",
    method: "GET",
    checkInterval: "60",
    timeout: "10",
    expectedStatusCode: "200",
  });

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        url: formData.url,
        description: formData.description,
        protocol: formData.protocol as "http" | "https",
        method: formData.method as "GET" | "POST" | "HEAD",
        checkInterval: parseInt(formData.checkInterval),
        timeout: parseInt(formData.timeout),
        expectedStatusCode: parseInt(formData.expectedStatusCode),
      });

      toast.success("Monitoring target created successfully");
      setIsOpen(false);
      setFormData({
        name: "",
        url: "",
        description: "",
        protocol: "https",
        method: "GET",
        checkInterval: "60",
        timeout: "10",
        expectedStatusCode: "200",
      });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to create target");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this target?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Target deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete target");
    }
  };

  const handleTest = async (id: number) => {
    try {
      const result = await testMutation.mutateAsync({ id });
      toast.success(
        `Test completed: ${result.isSuccess ? "✓ Success" : "✗ Failed"} (${result.responseTime}ms)`
      );
    } catch (error: any) {
      toast.error(error.message || "Test failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Targets</h1>
          <p className="text-muted-foreground mt-2">
            Manage the websites and services you want to monitor
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Target
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Monitoring Target</DialogTitle>
              <DialogDescription>
                Configure a new website or service to monitor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Target Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Website"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="example.com"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="protocol">Protocol</Label>
                  <Select
                    value={formData.protocol}
                    onValueChange={(value) =>
                      setFormData({ ...formData, protocol: value })
                    }
                  >
                    <SelectTrigger id="protocol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="https">HTTPS</SelectItem>
                      <SelectItem value="http">HTTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="method">Method</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) =>
                      setFormData({ ...formData, method: value })
                    }
                  >
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interval">Check Interval (seconds)</Label>
                  <Input
                    id="interval"
                    type="number"
                    value={formData.checkInterval}
                    onChange={(e) =>
                      setFormData({ ...formData, checkInterval: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={formData.timeout}
                    onChange={(e) =>
                      setFormData({ ...formData, timeout: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="statusCode">Expected Status Code</Label>
                <Input
                  id="statusCode"
                  type="number"
                  value={formData.expectedStatusCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedStatusCode: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="w-full"
              >
                {createMutation.isPending ? "Creating..." : "Create Target"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {targets.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No targets yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first monitoring target to get started
                </p>
                <Button onClick={() => setIsOpen(true)}>Add Target</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          targets.map((target) => (
            <Card key={target.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {target.name}
                      {target.isActive && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Active
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{target.url}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(target.id)}
                      disabled={testMutation.isPending}
                    >
                      Test
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(target.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Protocol</p>
                    <p className="font-semibold">{target.protocol.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Check Interval</p>
                    <p className="font-semibold">{target.checkInterval}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Timeout</p>
                    <p className="font-semibold">{target.timeout}s</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expected Status</p>
                    <p className="font-semibold">{target.expectedStatusCode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
