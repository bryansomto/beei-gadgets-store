"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import { SweetAlertResult } from "sweetalert2";
import { HashLoader } from "react-spinners";
import Layout from "./components/Layout";

interface Product {
  _id: string;
  title: string;
}

interface SettingsPageProps {
  swal: {
    fire: (options: {
      title: string;
      icon: "success" | "error" | "warning" | "info" | "question";
    }) => Promise<SweetAlertResult>;
  };
}

function SettingsPage({ swal }: SettingsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProductId, setFeaturedProductId] = useState<string>("");
  const [shippingFee, setShippingFee] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    fetchAll().finally(() => setIsLoading(false));
  }, []);

  async function fetchAll() {
    try {
      const [productsRes, featuredRes, shippingRes] = await Promise.all([
        axios.get<Product[]>("/api/products"),
        axios.get<{ value: string }>("/api/settings?name=featuredProductId"),
        axios.get<{ value: string }>("/api/settings?name=shippingFee"),
      ]);

      setProducts(productsRes.data);
      setFeaturedProductId(featuredRes.data.value);
      setShippingFee(shippingRes.data.value);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  }

  async function saveSettings() {
    setIsLoading(true);
    try {
      await Promise.all([
        axios.put("/api/settings", {
          name: "featuredProductId",
          value: featuredProductId,
        }),
        axios.put("/api/settings", {
          name: "shippingFee",
          value: shippingFee,
        }),
      ]);
      await swal.fire({
        title: "Settings saved",
        icon: "success",
      });
    } catch (err) {
      console.error("Failed to save settings", err);
      await swal.fire({
        title: "Failed to save settings",
        icon: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout requiresAuth>
      <h1>Settings</h1>
      {isLoading ? (
        <HashLoader color="#00A63E" size={28} />
      ) : (
        <>
          <label htmlFor="featuredProduct">Featured product</label>
          <select
            id="featuredProduct"
            value={featuredProductId}
            onChange={(e) => setFeaturedProductId(e.target.value)}
          >
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.title}
              </option>
            ))}
          </select>

          <label htmlFor="shippingPrice">Shipping price (in NGN)</label>
          <input
            id="shippingPrice"
            type="number"
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
          />

          <div className="mt-4">
            <button onClick={saveSettings} className="btn-primary">
              Save settings
            </button>
          </div>
        </>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }: { swal: any }) => (
  <SettingsPage swal={swal} />
));
