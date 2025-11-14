"use client";
import Layout from "./components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CreditCard, Users } from "lucide-react";
import { RecentSales } from "@/components/recent-sales";
import { Overview } from "@/components/overview";
import { useToast } from "@/components/ui/use-toast";
import { IconCurrencyNaira } from "@tabler/icons-react";

export default function Home() {
  const { toast } = useToast();

  // Mock data - replace with real API calls
  const stats = [
    {
      title: "Total Revenue",
      value: "₦1,564,900.00",
      change: "+20.1% from last month",
      icon: IconCurrencyNaira,
    },
    {
      title: "Active Products",
      value: "4",
      change: "+1 from last month",
      icon: CreditCard,
    },
    {
      title: "Categories",
      value: "2",
      change: "+2 from last quarter",
      icon: Users,
    },
    {
      title: "Recent Activity",
      value: "+51",
      change: "+12 since last hour",
      icon: Activity,
    },
  ];

  const recentSales = [
    {
      name: "iPhone 16",
      email: "electronics",
      amount: "+₦1,235,000.00",
    },
    {
      name: "Samsung Galaxy S25 Ultra",
      email: "accessories",
      amount: "+₦1,900,000.00",
    },
  ];

  const quickActions = [
    {
      title: "Add New Product",
      description: "Create a new product listing",
      action: () => toast({ title: "Navigate to product creation" }),
    },
    {
      title: "View Inventory",
      description: "See all available products",
      action: () => toast({ title: "Navigate to inventory" }),
    },
    {
      title: "Manage Categories",
      description: "Organize your product categories",
      action: () => toast({ title: "Navigate to categories" }),
    },
  ];

  return (
    <Layout requiresAuth>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentSales data={recentSales} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, i) => (
            <Card
              key={i}
              className="cursor-pointer hover:bg-accent transition-colors"
            >
              <CardContent className="p-6" onClick={action.action}>
                <h3 className="font-semibold leading-none tracking-tight">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {action.description}
                </p>
                <Button variant="ghost" size="sm" className="mt-4">
                  Take action
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
