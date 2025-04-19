"use client";
import { useState } from "react";
import axios from "axios";
import { buttonVariants } from "./ui/button";

export function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState(false);

  const [swalProps, setSwalProps] = useState({});
  interface AddUserEvent extends React.FormEvent<HTMLFormElement> {}

  interface SwalProps {
    show: boolean;
    title: string;
    text?: string;
    icon: "success" | "error" | "warning" | "info" | "question";
  }

  function addUser(ev: AddUserEvent): void {
    ev.preventDefault();
    const transformedFirstName: string =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const transformedLastName: string =
      lastName.charAt(0).toUpperCase() + lastName.slice(1);
    axios
      .post("/api/register", {
        email,
        password,
        firstName: transformedFirstName,
        lastName: transformedLastName,
      })
      .then((res) => {
        const name = `${transformedFirstName}'s`
          ? transformedFirstName !== ""
          : "User";
        setSwalProps({
          title: "User Created!",
          text: `${name} account has been registered successfully.`,
          icon: "success",
        });
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
      })
      .catch((err) => {
        setSwalProps({
          show: true,
          title: "Error!",
          text: err.response.data.message,
          icon: "error",
        });
      });
  }

  return (
    <form className="flex flex-col justify-center gap-4" onSubmit={addUser}>
      <label>
        <p>First Name</p>
        <input
          name="firstName"
          type="text"
          value={firstName}
          onChange={(ev) => setFirstName(ev.target.value)}
          placeholder="John"
          className="mb-0 w-72 pr-3 p-2 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        />
      </label>
      <label>
        <p>Last Name</p>
        <input
          name="lastName"
          type="text"
          value={lastName}
          onChange={(ev) => setLastName(ev.target.value)}
          placeholder="Doe"
          className="mb-0 w-72 pr-3 p-2 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        />
      </label>
      <label>
        <p>Email</p>
        <input
          name="email"
          type="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          placeholder="email@beeigadgetsstore.com"
          className="mb-0 w-72 pr-3 p-2 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        />
      </label>
      <label>
        <p>Password</p>
        <input
          name="password"
          type="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          placeholder="************"
          className="mb-0 w-72 pr-3  p-2 border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
        />
      </label>
      <button
        type="submit"
        className={`${buttonVariants({ size: "lg" })} cursor-pointer`}
      >
        {progress ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
