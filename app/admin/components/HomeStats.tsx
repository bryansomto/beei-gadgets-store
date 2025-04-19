"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { subHours } from "date-fns";
import { HashLoader } from "react-spinners";

interface LineItem {
  quantity: number;
  price_data: {
    unit_amount: number;
  };
}

interface Order {
  createdAt: string;
  line_items: LineItem[];
}

export default function HomeStats() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    axios.get<Order[]>("/api/orders").then((res) => {
      setOrders(res.data);
      setIsLoading(false);
    });
  }, []);

  function ordersTotal(orders: Order[]): string {
    const sum = orders.reduce((total, order) => {
      const orderTotal = order.line_items.reduce((subTotal, item) => {
        return subTotal + item.quantity * item.price_data.unit_amount;
      }, 0);
      return total + orderTotal;
    }, 0);

    return new Intl.NumberFormat("en-NG").format(sum);
  }

  if (isLoading) {
    return (
      <div className="my-4">
        <HashLoader color="#00A63E" size={28} />
      </div>
    );
  }

  const now = new Date();
  const ordersToday = orders.filter(
    (o) => new Date(o.createdAt) > subHours(now, 24)
  );
  const ordersWeek = orders.filter(
    (o) => new Date(o.createdAt) > subHours(now, 24 * 7)
  );
  const ordersMonth = orders.filter(
    (o) => new Date(o.createdAt) > subHours(now, 24 * 30)
  );

  return (
    <div>
      <h2>Orders</h2>
      <div className="tiles-grid">
        <div className="tile">
          <h3 className="tile-header">Today</h3>
          <div className="tile-number">{ordersToday.length}</div>
          <div className="tile-desc">{ordersToday.length} orders today</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">This week</h3>
          <div className="tile-number">{ordersWeek.length}</div>
          <div className="tile-desc">{ordersWeek.length} orders this week</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">This month</h3>
          <div className="tile-number">{ordersMonth.length}</div>
          <div className="tile-desc">
            {ordersMonth.length} orders this month
          </div>
        </div>
      </div>

      <h2>Revenue</h2>
      <div className="tiles-grid">
        <div className="tile">
          <h3 className="tile-header">Today</h3>
          <div className="tile-number">₦ {ordersTotal(ordersToday)}</div>
          <div className="tile-desc">{ordersToday.length} orders today</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">This week</h3>
          <div className="tile-number">₦ {ordersTotal(ordersWeek)}</div>
          <div className="tile-desc">{ordersWeek.length} orders this week</div>
        </div>
        <div className="tile">
          <h3 className="tile-header">This month</h3>
          <div className="tile-number">₦ {ordersTotal(ordersMonth)}</div>
          <div className="tile-desc">
            {ordersMonth.length} orders this month
          </div>
        </div>
      </div>
    </div>
  );
}
