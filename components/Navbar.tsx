"use client";

import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { SignOutButton } from "./SessionButtons";
import useUser from "@/lib/userSession";
import { HashLoader } from "react-spinners";
import { useState } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import { buttonVariants } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useCart } from "@/context/CartContext";

const Navbar = () => {
  const { user, isAdmin, image, initials, loading } = useUser();
  const { cartCount, clearCart, cartItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  if (loading) {
    return (
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <div>
            <Link href="/" className="flex z-40 font-semibold text-xl">
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
    <nav className="sticky z-[100] h-16 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex z-40 font-semibold text-xl">
            <span className="text-green-600">beei</span>gadgets
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-black transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-black transition-colors"
            >
              Contact
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-black transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Avatar Dropdown */}
            <div className="relative inline-block">
              <Avatar
                onClick={toggleMenu}
                className="ring-2 ring-primary/80 ring-offset-1 cursor-pointer hover:ring-primary transition-all"
              >
                {isOpen ? (
                  <X size={20} className="m-auto" />
                ) : (
                  <>
                    <AvatarImage
                      src={image}
                      alt={`@${user?.firstName}`}
                      loading="lazy"
                    />
                    <AvatarFallback className="bg-gray-100">
                      <span className="text-sm font-medium">
                        {initials || "U"}
                      </span>
                    </AvatarFallback>
                  </>
                )}
              </Avatar>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 border border-gray-200 bg-white rounded-lg shadow-lg px-4 py-3 space-y-3 z-40">
                  {user && (
                    <div className="space-y-2">
                      <Link
                        href="/account"
                        onClick={toggleMenu}
                        className="block text-sm text-gray-700 hover:text-black hover:bg-gray-50 px-2 py-1 rounded"
                      >
                        My Account
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={toggleMenu}
                          className="block text-sm text-gray-700 hover:text-black hover:bg-gray-50 px-2 py-1 rounded"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <div
                        onClick={toggleMenu}
                        className="pt-2 border-t border-gray-100"
                      >
                        <SignOutButton className="w-full" />
                      </div>
                    </div>
                  )}

                  {!user && (
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        onClick={toggleMenu}
                        className="block text-sm text-gray-700 hover:text-black hover:bg-gray-50 px-2 py-1 rounded"
                      >
                        Log In
                      </Link>
                      <Link
                        href="/register"
                        onClick={toggleMenu}
                        className="block text-sm text-gray-700 hover:text-black hover:bg-gray-50 px-2 py-1 rounded"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-4">
            {/* Mobile Cart Link */}
            <Link href="/cart" className="relative p-2 text-gray-700">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Avatar
              onClick={toggleMenu}
              className="ring-2 ring-primary/80 ring-offset-1 cursor-pointer hover:ring-primary transition-all"
            >
              {isOpen ? (
                <X size={20} className="m-auto" />
              ) : (
                <>
                  <AvatarImage src={image} alt={`@${user?.firstName}`} />
                  <AvatarFallback className="bg-gray-100">
                    <span className="text-sm font-medium">
                      {initials || "U"}
                    </span>
                  </AvatarFallback>
                </>
              )}
            </Avatar>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg transition-all px-4 py-3 space-y-3">
            <Link
              href="/"
              onClick={toggleMenu}
              className="block py-2 text-gray-700 hover:text-black hover:bg-gray-50 px-2 rounded transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={toggleMenu}
              className="block py-2 text-gray-700 hover:text-black hover:bg-gray-50 px-2 rounded transition-colors"
            >
              Products
            </Link>
            <Link
              href="/about"
              onClick={toggleMenu}
              className="block py-2 text-gray-700 hover:text-black hover:bg-gray-50 px-2 rounded transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={toggleMenu}
              className="block py-2 text-gray-700 hover:text-black hover:bg-gray-50 px-2 rounded transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/account"
              onClick={toggleMenu}
              className="block py-2 text-gray-700 hover:text-black hover:bg-gray-50 px-2 rounded transition-colors"
            >
              My Account
            </Link>

            {user && (
              <div className="pt-2 border-t border-gray-100">
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={toggleMenu}
                    className="block py-2 text-gray-700 hover:text-black hover:bg-gray-50 px-2 rounded transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div onClick={toggleMenu} className="w-full">
                  <SignOutButton cartItems={cartItems} className="w-full" />
                </div>
              </div>
            )}

            {!user && (
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <Link
                  href="/login"
                  onClick={toggleMenu}
                  className="block py-2 text-gray-700 hover:text-black hover:bg-gray-50 px-2 rounded transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={toggleMenu}
                  className="block py-2 text-gray-700 hover:text-black hover:bg-gray-50 px-2 rounded transition-colors"
                >
                  Register
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
