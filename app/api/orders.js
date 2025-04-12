import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";

export default async function handler(req, res) {
  const { method } = req;
  await mongooseConnect();
  if (method === "GET") {
    res.json(await Order.find().sort({ createdAt: -1 }));
  }

  if (method === "PUT") {
    const { OrderId, orderStatus } = req.body;
    if (orderStatus) {
      await Order.updateOne(
        { _id: OrderId },
        {
          paid: false,
        }
      );
    } else {
      await Order.updateOne(
        { _id: OrderId },
        {
          paid: true,
        }
      );
    }
    res.json(true);
  }
}
