"use client";

import { prettyDate } from "@/lib/date";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";
import { MailIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import Layout from "../components/Layout";
import { HashLoader } from "react-spinners";
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
import colors from "@/lib/colors/swalAlerts";

function AdminsPage({ swal }: { swal: any }) {
  const [email, setEmail] = useState("");
  const [adminEmails, setAdminEmails] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  interface Admin {
    _id: string;
    email: string;
    createdAt?: string;
  }

  interface AddAdminResponse {
    message: string;
  }

  const formSchema = z.object({
    email: z.string().min(1, {
      message: "Email must be a valid one",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function addAdmin(data: z.infer<typeof formSchema>) {
    axios
      .post<AddAdminResponse>("/api/admins", { email: data.email })
      .then((res) => {
        swal.fire({
          title: "Admin created!",
          icon: "success",
          confirmButtonColor: colors.green,
        });
        form.reset(); // reset form after success
        loadAdmins();
      })
      .catch((err: any) => {
        swal.fire({
          title: "Error!",
          text: err?.response?.data?.message || "An unexpected error occurred",
          icon: "error",
        });
      });
  }
  interface DeleteAdminResult {
    isConfirmed: boolean;
  }

  function deleteAdmin(_id: string, email: string) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete admin ${email}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: colors.red,
        reverseButtons: true,
      })
      .then(async (result: DeleteAdminResult) => {
        if (result.isConfirmed) {
          axios.delete("/api/admins?_id=" + _id).then(() => {
            swal.fire({
              title: "Admin deleted!",
              icon: "success",
              confirmButtonColor: colors.green,
            });
            loadAdmins();
          });
        }
      });
  }
  function loadAdmins() {
    setIsLoading(true);
    axios.get("/api/admins").then((res) => {
      setAdminEmails(res.data);
      setIsLoading(false);
    });
  }
  useEffect(() => {
    loadAdmins();
  }, []);
  return (
    <Layout>
      <h2 className="tracking-tight text-left text-balance !leading-tight font-bold text-3xl md:text-4xl text-gray-900">
        Add new admin
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(addAdmin)}
          className="w-full max-w-sm space-y-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin e-mail</FormLabel>
                <FormControl>
                  <div className="relative flex items-center text-slate-400 focus-within:text-slate-600">
                    <MailIcon className="w-5 h-5 absolute ml-3 pointer-events-none" />
                    <Input
                      type="email"
                      className="pl-10"
                      placeholder="email@beeigadgetsstore.com"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            type="submit"
            className={`${buttonVariants({
              variant: "default",
            })} cursor-pointer w-full`}
          >
            Add
          </button>
        </form>
      </Form>
      <div className="flex justify-center w-full">
        <div className="w-full max-w-xl">
          <Table className="mx-auto">
            <TableCaption className="text-center">
              Administrators of the store.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="font-normal">
                  Admin google email
                </TableHead>
                <TableHead className="font-normal">Created at</TableHead>
                <TableHead className="font-normal">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="flex justify-center py-4">
                      <HashLoader color="#00A63E" size={28} />
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {adminEmails.length > 0 &&
                adminEmails.map((adminEmail, _id) => (
                  <TableRow key={_id}>
                    <TableCell>{adminEmail.email}</TableCell>
                    <TableCell>
                      {adminEmail.createdAt && prettyDate(adminEmail.createdAt)}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          deleteAdmin(adminEmail._id, adminEmail.email)
                        }
                        className={`${buttonVariants({
                          size: "sm",
                          variant: "destructive",
                        })} cursor-pointer`}
                      >
                        Delete
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}

export default withSwal(({ swal }: { swal: any }) => (
  <AdminsPage swal={swal} />
));
