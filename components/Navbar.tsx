"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { SignOutButton } from "./SessionButtons";
import useUser from "@/lib/userSession";
import { HashLoader } from "react-spinners";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Navbar = () => {
  const { user, isAdmin, image, initials, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  if (loading) {
    return (
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between">
          <div>
            <Link href="/" className="flex z-40 font-semibold">
              <span className="text-green-600">beei</span>gadgets
            </Link>
          </div>
          <div>
            <HashLoader color="#00A63E" size={28} />
          </div>
        </div>
      </MaxWidthWrapper>
    );
  }

  return (
    <nav className="sticky z-[100] h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex z-40 font-semibold">
            <span className="text-green-600">beei</span>gadgets
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-black">
              Home
            </Link>
            <Link href="/products" className="text-gray-600 hover:text-black">
              Products
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-black">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-black">
              Contact
            </Link>

            <div className="relative inline-block">
              {/* Avatar */}
              <div className="z-50">
                <Avatar
                  onClick={toggleMenu}
                  className="ring-2 ring-primary/80 ring-offset-1 cursor-pointer"
                >
                  {isOpen ? (
                    <X size={24} className="mt-[8px] ml-[8px]" />
                  ) : (
                    <>
                      <AvatarImage src={image || ""} alt={`@${user?.name}`} />
                      <AvatarFallback>
                        <b>{initials || "U"}</b>
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
              </div>

              {/* Dropdown */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 flex flex-col-reverse border border-gray-200 bg-white/95 backdrop-blur-lg rounded-lg shadow-lg px-4 py-3 space-y-4 z-40">
                  {user && (
                    <div>
                      {isAdmin && (
                        <div className="-ml-2.5">
                          <Link
                            href="/admin"
                            onClick={toggleMenu}
                            className={buttonVariants({
                              size: "sm",
                              variant: "ghost",
                            })}
                          >
                            Configure 🛠
                          </Link>
                        </div>
                      )}
                      <div onClick={toggleMenu} className="-ml-2.5">
                        <SignOutButton />
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div className="-ml-2.5">
                      <Link
                        href="/login"
                        onClick={toggleMenu}
                        className={buttonVariants({
                          size: "sm",
                          variant: "ghost",
                        })}
                      >
                        Log In
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden z-50">
            <Avatar
              onClick={toggleMenu}
              className="ring-2 ring-primary/80 ring-offset-1 cursor-pointer"
            >
              {isOpen ? (
                <X size={24} className="mt-[8px] ml-[8px]" />
              ) : (
                <>
                  <AvatarImage src={image || ""} alt={`@${user?.name}`} />
                  <AvatarFallback>
                    <b>{initials || "U"}</b>
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            {/* <button onClick={toggleMenu}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button> */}
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-b border-gray-200 bg-white/95 backdrop-blur-lg transition-all px-4 py-3 space-y-4 ">
            <Link
              href="/"
              onClick={toggleMenu}
              className="block text-gray-600 hover:text-black"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={toggleMenu}
              className="block text-gray-600 hover:text-black"
            >
              Products
            </Link>
            <Link
              href="/about"
              onClick={toggleMenu}
              className="block text-gray-600 hover:text-black"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={toggleMenu}
              className="block text-gray-600 hover:text-black"
            >
              Contact
            </Link>
            {user && (
              <>
                <div onClick={toggleMenu} className="-ml-2.5">
                  <SignOutButton />
                </div>

                {isAdmin && (
                  <div className="-ml-2.5">
                    <Link
                      href="/admin"
                      onClick={toggleMenu}
                      className={buttonVariants({
                        size: "sm",
                        variant: "ghost",
                      })}
                    >
                      Configure 🛠
                    </Link>
                  </div>
                )}
              </>
            )}

            {!user && (
              <div className="-ml-2.5">
                <Link
                  href="/login"
                  onClick={toggleMenu}
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        )}
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
