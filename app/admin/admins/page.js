"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Spinner from "../components/Spinner";
import { prettyDate } from "@/lib/date";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";
import Nav from "../components/MenuBar";
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

function AdminsPage({ swal }) {
  const [email, setEmail] = useState("");
  const [adminEmails, setAdminEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  function addAdmin(ev) {
    ev.preventDefault();
    axios
      .post("/api/admins", { email })
      .then((res) => {
        console.log(res.data);
        swal.fire({
          title: "Admin created!",
          icon: "success",
        });
        setEmail("");
        loadAdmins();
      })
      .catch((err) => {
        swal.fire({
          title: "Error!",
          text: err.response.data.message,
          icon: "error",
        });
      });
  }
  function deleteAdmin(_id, email) {
    swal
      .fire({
        title: "Are you sure?",
        text: `Do you want to delete admin ${email}?`,
        showCancelButton: true,
        cancelButtonText: "Cancel",
        confirmButtonText: "Yes, Delete!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          axios.delete("/api/admins?_id=" + _id).then(() => {
            swal.fire({
              title: "Admin deleted!",
              icon: "success",
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
      <div className="flex flex-col flex-grow items-center">
        <h2 className="mt-2 tracking-tight text-center text-balance !leading-tight font-bold text-5xl md:text-6xl text-gray-900">
          Add new admin
        </h2>
        <div className="space-y-6">
          <form onSubmit={addAdmin} className="w-full max-w-sm">
            <div className="mt-2 space-y-2">
              <div className="relative flex items-center text-slate-400 focus-within:text-slate-600">
                <MailIcon className="w-5 h-5 absolute ml-3 pointer-events-none" />
                <input
                  type="email"
                  className="mb-0 w-72 pr-3 pl-10 p-2 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  placeholder="email@beeigadgetsstore.com"
                />
              </div>
              <button
                type="submit"
                className={`${buttonVariants({
                  size: "sm",
                  variant: "default",
                })} cursor-pointer w-30`}
              >
                Add
              </button>
            </div>
          </form>
          <Table>
            <TableCaption>Administrators of the store.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left font-normal">
                  Admin google email
                </TableHead>
                <TableHead className="text-left font-normal">
                  Created at
                </TableHead>
                <TableHead className="text-left font-normal">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell>
                    <div className="py-4">
                      <Spinner fullWidth={true} />
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

export default withSwal(({ swal }) => <AdminsPage swal={swal} />);
