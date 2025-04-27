"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import { MailIcon, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Layout from "../components/Layout";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { prettyDate } from "@/lib/date";
import colors from "@/lib/colors/swalAlerts";

interface Admin {
  _id: string;
  email: string;
  createdAt?: string;
}

interface AdminsPageProps {
  swal: {
    fire: (options: any) => Promise<{ isConfirmed: boolean }>;
  };
}

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function AdminsPage({ swal }: AdminsPageProps) {
  const [adminEmails, setAdminEmails] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const loadAdmins = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get<Admin[]>("/api/admins");
      setAdminEmails(data);
    } catch (error) {
      console.error("Failed to load admins", error);
      toast({
        title: "Error",
        description: "Failed to load admin list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAdmin = async (formData: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await axios.post("/api/admins", { email: formData.email });

      swal.fire({
        title: "Success!",
        text: "Admin added successfully",
        icon: "success",
        confirmButtonColor: colors.green,
      });

      form.reset();
      await loadAdmins();
    } catch (error: any) {
      console.error("Failed to add admin", error);
      swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to add admin",
        icon: "error",
        confirmButtonColor: colors.red,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAdmin = async (_id: string, email: string) => {
    const result = await swal.fire({
      title: "Are you sure?",
      text: `Remove admin access for ${email}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.red,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/admins?_id=${_id}`);

        toast({
          title: "Success",
          description: "Admin removed successfully",
        });

        await loadAdmins();
      } catch (error) {
        console.error("Failed to delete admin", error);
        toast({
          title: "Error",
          description: "Failed to remove admin",
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  return (
    <Layout requiresAuth>
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Admin Management
          </h2>
          <p className="text-muted-foreground">
            Add or remove administrators for the store
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(addAdmin)}
            className="space-y-4 max-w-md"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="admin@example.com"
                        className="pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Admin"
              )}
            </Button>
          </form>
        </Form>

        <div className="rounded-md border">
          <Table>
            <TableCaption>Current administrators</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : adminEmails.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No administrators found
                  </TableCell>
                </TableRow>
              ) : (
                adminEmails.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>
                      {admin.createdAt ? prettyDate(admin.createdAt) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAdmin(admin._id, admin.email)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}

export default withSwal(AdminsPage);
