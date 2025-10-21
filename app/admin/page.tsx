"use client";
import Layout from "./components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { RecentSales } from "@/components/recent-sales";
import { Overview } from "@/components/overview";
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const { toast } = useToast();

  // Mock data - replace with real API calls
  const stats = [
    {
      title: "Total Revenue",
      value: "₦45,231.89",
      change: "+20.1% from last month",
      icon: DollarSign,
    },
    {
      title: "Active Products",
      value: "124",
      change: "+12 from last month",
      icon: CreditCard,
    },
    {
      title: "Categories",
      value: "8",
      change: "+2 from last quarter",
      icon: Users,
    },
    {
      title: "Recent Activity",
      value: "+573",
      change: "+201 since last hour",
      icon: Activity,
    },
  ];

  const recentSales = [
    {
      name: "Wireless Earbuds",
      email: "electronics",
      amount: "+₦1,999.00",
    },
    {
      name: "Leather Wallet",
      email: "accessories",
      amount: "+₦49.99",
    },
    {
      name: "Smart Watch",
      email: "electronics",
      amount: "+₦299.99",
    },
    {
      name: "Cotton T-Shirt",
      email: "clothing",
      amount: "+₦29.99",
    },
    {
      name: "Ceramic Mug",
      email: "home",
      amount: "+₦12.99",
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
