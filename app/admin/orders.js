import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useRouter } from "next/router";
import axios from "axios";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [goToOrders, setGoToOrders] = useState(false);
  const router = useRouter();
  useEffect(() => {
    axios.get("/api/orders").then((response) => {
      setOrders(response.data);
    });
  }, []);

  async function manualConfirmation(OrderId, orderStatus) {
    console.log(OrderId);
    await axios.put("/api/orders", { OrderId, orderStatus });
    setGoToOrders(true);
  }
  if (goToOrders) {
    router.push("/orders");
  }
  return (
    <Layout>
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
          {orders.length > 0 &&
            orders.map((order, index) => (
              <tr key={index}>
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
                  {order.name} {order.email} <br />
                  {order.city} {order.postalCode} {order.country} <br />
                  {order.streetAddress}
                </td>
                <td>
                  {order.line_items.map((l, index) => (
                    <p key={index}>
                      {l.price_data?.product_data?.name} x {l.quantity}
                      <br />
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
