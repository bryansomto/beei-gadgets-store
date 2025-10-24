"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { MailIcon, Loader2, Trash2, Plus, Shield, Search } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { prettyDate } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Admin {
  _id: string;
  email: string;
  createdAt?: string;
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function AdminsPage() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const fetchAdmins = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<Admin[] | { admins: Admin[] }>(
        "/api/admins"
      );
      const list = Array.isArray(data) ? data : data.admins || [];
      setAdmins(list);
    } catch (error) {
      console.error("Failed to load admins", error);
      toast({
        title: "Error",
        description: "Failed to load admin list",
        variant: "destructive",
      });
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleAddAdmin = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await axios.post("/api/admins", { email: values.email });

      toast({
        title: "Success",
        description: "Admin added successfully",
      });

      form.reset();
      fetchAdmins();
    } catch (error) {
      console.error("Failed to add admin", error);
      toast({
        title: "Error",
        description: "Failed to add admin",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function confirmDelete(email: string): Promise<boolean> {
    return new Promise((resolve) => {
      toast({
        title: `Remove "${email}"?`,
        description: "This action cannot be undone.",
        action: (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => resolve(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => resolve(true)}
            >
              Delete
            </Button>
          </div>
        ),
      });
    });
  }

  const handleDeleteAdmin = async (admin: Admin) => {
    try {
      setIsDeleting(admin._id);
      const confirmed = await confirmDelete(admin.email);
      if (!confirmed) return;

      await axios.delete(`/api/admins?_id=${admin._id}`);
      toast({
        title: "Removed",
        description: `${admin.email} is no longer an admin.`,
      });
      fetchAdmins();
    } catch (error) {
      console.error("Failed to delete admin", error);
      toast({
        title: "Error",
        description: "Failed to remove admin",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredAdmins = admins.filter((a) =>
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout requiresAuth>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Administrators
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage users with administrative privileges
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Add Admin Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailIcon className="h-5 w-5" /> Add Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleAddAdmin)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="admin@example.com"
                              className="pl-9"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" /> Add Admin
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Admins Table */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Current Admins
                <Badge variant="secondary" className="ml-2">
                  {filteredAdmins.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-4 w-[180px]" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-[100px]" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-8 w-8 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredAdmins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12">
                          <Shield className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="text-sm text-muted-foreground">
                            {searchQuery
                              ? "No matching admins found"
                              : "No admins added yet"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAdmins.map((admin) => (
                        <TableRow
                          key={admin._id}
                          className="group hover:bg-muted/50"
                        >
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            {admin.createdAt
                              ? prettyDate(admin.createdAt)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteAdmin(admin)}
                              disabled={isDeleting === admin._id}
                              className="h-8 w-8"
                            >
                              {isDeleting === admin._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
