"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, Save, MapPin, User, Mail, Phone, Home } from "lucide-react";
import { toast } from "react-hot-toast";
import useUser from "@/lib/userSession";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { phoneSchema } from "@/lib/phoneSchema";

// Define your form schemas
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: phoneSchema,
});

const addressSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  streetAddress: z.string().min(1, "Street address is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type AddressFormData = z.infer<typeof addressSchema>;

const AccountSkeleton = () => (
  <div className="max-w-4xl mx-auto p-4">
    <Skeleton className="h-9 w-48 mb-6" />
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="profile">
          <Skeleton className="h-5 w-24" />
        </TabsTrigger>
        <TabsTrigger value="address">
          <Skeleton className="h-5 w-32" />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-5 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-32 mt-4" />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="address">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-32 mt-4" />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default function AccountPage() {
  const {
    user,
    loading: isUserLoading,
    authenticated: isAuthenticated,
  } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  const {
    control: addressControl,
    handleSubmit: handleAddressSubmit,
    formState: { errors: addressErrors, isSubmitting: isAddressSubmitting },
    reset: resetAddress,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      streetAddress: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isUserLoading && !isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [isUserLoading, isAuthenticated, router]);

  // Load profile data
  useEffect(() => {
    if (!user) return;

    const loadProfileData = async () => {
      try {
        // Fetch user profile data from API
        const { data: profileData } = await axios.get("/api/user/profile");

        resetProfile({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || user.email || "",
          phoneNumber: profileData.phoneNumber || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        // Fallback to user data from session
        resetProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
        });
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfileData();
  }, [user, resetProfile]);

  // Load address data
  useEffect(() => {
    if (!user?.email) return;

    const loadAddressData = async () => {
      try {
        const { data: addressData } = await axios.get<AddressFormData>(
          "/api/address",
          {
            params: { userEmail: user.email },
          }
        );

        if (addressData) {
          resetAddress(addressData);
        } else {
          // Initialize with user name if no address exists
          const fullName =
            [user.firstName, user.lastName].filter(Boolean).join(" ") || "";
          resetAddress({
            name: fullName,
            streetAddress: "",
            state: "",
            postalCode: "",
            country: "",
          });
        }
      } catch (err) {
        console.error("Failed to load address:", err);
        // Initialize with empty values if no address exists
        const fullName =
          [user.firstName, user.lastName].filter(Boolean).join(" ") || "";
        resetAddress({
          name: fullName,
          streetAddress: "",
          state: "",
          postalCode: "",
          country: "",
        });
      } finally {
        setIsAddressLoading(false);
      }
    };

    loadAddressData();
  }, [user, resetAddress]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      // Update profile via the API
      const response = await axios.put("/api/user/profile", {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });

      // Update the form with the returned data
      resetProfile(response.data);

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);

      if (axios.isAxiosError(err)) {
        console.error("API error response:", err.response?.data);
        console.error("API error status:", err.response?.status);
      }

      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message || "Failed to update profile"
        : "Failed to update profile";

      toast.error(errorMessage);
    }
  };

  const onAddressSubmit = async (data: AddressFormData) => {
    if (!user?.email) {
      toast.error("Please sign in to save your address");
      return;
    }

    try {
      await axios.post("/api/address", {
        userEmail: user.email,
        ...data,
      });

      toast.success("Address updated successfully!");
    } catch (err) {
      console.error("Failed to save address:", err);
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Failed to save address"
          : "Failed to save address"
      );
    }
  };

  if (isUserLoading || isProfileLoading || isAddressLoading) {
    return <AccountSkeleton />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="address" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Delivery Information
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleProfileSubmit(onProfileSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Controller
                      name="firstName"
                      control={profileControl}
                      render={({ field }) => (
                        <>
                          <Input id="firstName" {...field} />
                          {profileErrors.firstName && (
                            <p className="text-sm text-red-500">
                              {profileErrors.firstName.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Controller
                      name="lastName"
                      control={profileControl}
                      render={({ field }) => (
                        <>
                          <Input id="lastName" {...field} />
                          {profileErrors.lastName && (
                            <p className="text-sm text-red-500">
                              {profileErrors.lastName.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Controller
                    name="email"
                    control={profileControl}
                    render={({ field }) => (
                      <>
                        <Input id="email" type="email" {...field} disabled />
                        <p className="text-sm text-muted-foreground">
                          Email cannot be changed
                        </p>
                      </>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Controller
                    name="phoneNumber"
                    control={profileControl}
                    render={({ field }) => (
                      <>
                        <Input id="phoneNumber" {...field} />
                        {profileErrors.phoneNumber && (
                          <p className="text-sm text-red-500">
                            {profileErrors.phoneNumber.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isProfileSubmitting}
                  className="gap-2"
                >
                  {isProfileSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>
                Update your default delivery address for orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleAddressSubmit(onAddressSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Controller
                    name="name"
                    control={addressControl}
                    render={({ field }) => (
                      <>
                        <Input id="name" {...field} />
                        {addressErrors.name && (
                          <p className="text-sm text-red-500">
                            {addressErrors.name.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="streetAddress"
                    className="flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Street Address
                  </Label>
                  <Controller
                    name="streetAddress"
                    control={addressControl}
                    render={({ field }) => (
                      <>
                        <Input id="streetAddress" {...field} />
                        {addressErrors.streetAddress && (
                          <p className="text-sm text-red-500">
                            {addressErrors.streetAddress.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Controller
                      name="state"
                      control={addressControl}
                      render={({ field }) => (
                        <>
                          <Input id="state" {...field} />
                          {addressErrors.state && (
                            <p className="text-sm text-red-500">
                              {addressErrors.state.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Controller
                      name="postalCode"
                      control={addressControl}
                      render={({ field }) => (
                        <>
                          <Input id="postalCode" {...field} />
                          {addressErrors.postalCode && (
                            <p className="text-sm text-red-500">
                              {addressErrors.postalCode.message}
                            </p>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Controller
                    name="country"
                    control={addressControl}
                    render={({ field }) => (
                      <>
                        <Input id="country" {...field} />
                        {addressErrors.country && (
                          <p className="text-sm text-red-500">
                            {addressErrors.country.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isAddressSubmitting}
                  className="gap-2"
                >
                  {isAddressSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Address
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
