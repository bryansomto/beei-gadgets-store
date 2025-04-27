"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "./components/Layout";

interface LineItem {
  quantity: number;
  price_data?: {
    product_data?: {
      name?: string;
    };
  };
}

interface Order {
  _id: string;
  createdAt: string;
  paid: boolean;
  name: string;
  email: string;
  city: string;
  postalCode: string;
  country: string;
  streetAddress: string;
  line_items: LineItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [goToOrders, setGoToOrders] = useState(false);
  const router = useRouter();

  useEffect(() => {
    axios.get<Order[]>("/api/orders").then((res) => {
      setOrders(res.data);
    });
  }, []);

  async function manualConfirmation(OrderId: string, currentStatus: boolean) {
    const updatedStatus = !currentStatus;
    await axios.put("/api/orders", { OrderId, orderStatus: updatedStatus });
    setGoToOrders(true);
  }

  useEffect(() => {
    if (goToOrders) {
      router.push("/admin/orders");
    }
  }, [goToOrders, router]);

  return (
    <Layout requiresAuth>
      <h1>Orders</h1>
      <table className="basic">
        <thead>
          <tr>
            <th>Date</th>
            <th>Paid</th>
            <th>Recipient</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td className={order.paid ? "text-green-600" : "text-red-600"}>
                {order.paid ? "YES" : "NO"}
                <br />
                <button
                  className="btn-status"
                  onClick={() => manualConfirmation(order._id, order.paid)}
                >
                  Change
                </button>
              </td>
              <td>
                {order.name} ({order.email})<br />
                {order.city}, {order.postalCode}, {order.country}
                <br />
                {order.streetAddress}
              </td>
              <td>
                {order.line_items.map((item, index) => (
                  <p key={index}>
                    {item.price_data?.product_data?.name || "Unknown product"} x{" "}
                    {item.quantity}
                  </p>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
