"use client";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Spinner from "../components/Spinner";
import { prettyDate } from "@/lib/date";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from "react-sweetalert2";
import Nav from "../components/SideNavbar";
import { MailIcon } from "lucide-react";

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
    <MaxWidthWrapper>
      <div className="bg-bgGray min-h-screen ">
        <div className="sm:hidden flex items-center justify-center p-2"></div>

        <div className="flex">
          <Nav />
          <div className="flex-grow p-4">
            <h2 className="tracking-tight text-balance !leading-tight font-bold  text-gray-900">
              Add new admin
            </h2>

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
                  className="bg-[#13AD4D] text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-[#13AD4D]/80 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </form>
            <h2 className="mt-10 mb-4 tracking-tight text-center text-balance !leading-tight font-bold  text-gray-900">
              Admin List
            </h2>
            <table className="basic">
              <thead>
                <tr>
                  <th className="text-left font-normal">Admin google email</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={2}>
                      <div className="py-4">
                        <Spinner fullWidth={true} />
                      </div>
                    </td>
                  </tr>
                )}
                {adminEmails.length > 0 &&
                  adminEmails.map((adminEmail, _id) => (
                    <tr key={_id}>
                      <td>{adminEmail.email}</td>
                      <td>
                        {adminEmail.createdAt &&
                          prettyDate(adminEmail.createdAt)}
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            deleteAdmin(adminEmail._id, adminEmail.email)
                          }
                          className="btn-red"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}

export default withSwal(({ swal }) => <AdminsPage swal={swal} />);
