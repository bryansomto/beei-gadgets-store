// app/api/checkout/route.ts
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Setting } from "@/models/Setting";
import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { z } from 'zod';
import Monnify from 'monnify-js';

// Input validation schema
const CheckoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  city: z.string().min(2),
  postalCode: z.string().min(3),
  streetAddress: z.string().min(5),
  country: z.string().min(2),
  cartProducts: z.array(z.string()).nonempty(),
});

export async function POST(req: Request) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Request Validation
    const body = await req.json();
    const validation = CheckoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, email, city, postalCode, streetAddress, country, cartProducts } = validation.data;

    await mongooseConnect();

    // Process Products
    const uniqueIds = [...new Set(cartProducts)];
    const products = await Product.find({ _id: { $in: uniqueIds } });

    const { line_items, totalProductAmount } = cartProducts.reduce(
      (acc: { line_items: any[]; totalProductAmount: number }, productId: string) => {
        const product = products.find(p => p._id.toString() === productId);
        if (!product) return acc;

        const quantity = cartProducts.filter(id => id === productId).length;
        if (quantity <= 0) return acc;

        const itemTotal = quantity * product.price;
        
        acc.line_items.push({
          productId,
          quantity,
          price_data: {
            currency: "NGN",
            product_data: { name: product.title },
            unit_amount: itemTotal,
          },
        });

        acc.totalProductAmount += itemTotal;
        return acc;
      },
      { line_items: [], totalProductAmount: 0 }
    );

    // Calculate Total
    const shippingFeeSetting = await Setting.findOne({ name: "shippingFee" });
    const shippingFeeAmount = parseInt(shippingFeeSetting?.value || "0", 10);
    const totalAmount = totalProductAmount + shippingFeeAmount;

    if (totalAmount <= 0) {
      throw new Error("Invalid total amount");
    }

    // Create Order
    const orderDoc = await Order.create({
      line_items,
      name,
      email,
      city,
      postalCode,
      streetAddress,
      country,
      paid: false,
      userEmail: session.user.email,
      userId: session.user.id,
      totalAmount,
      shippingFee: shippingFeeAmount,
      status: "pending",
    });

    // Initialize Payment
    if (!process.env.MONNIFY_API_KEY || !process.env.MONNIFY_CONTRACT_CODE) {
      throw new Error("Payment configuration error");
    }

    const monnify = new Monnify(
      process.env.MONNIFY_API_KEY,
      process.env.MONNIFY_CONTRACT_CODE
    );

    const paymentOptions = {
      amount: totalAmount,
      currency: "NGN",
      reference: `order_${orderDoc._id}_${Date.now()}`,
      paymentDescription: `Order #${orderDoc._id}`,
      customerFullName: name,
      customerEmail: email,
      paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
      redirectUrl: `${process.env.NEXT_PUBLIC_URL}/checkout/success?orderId=${orderDoc._id}`,
      onComplete: (response: any) => {
        console.log('Payment completed:', response);
        updateOrderStatus(orderDoc._id.toString(), 'completed');
      },
      onClose: (data: any) => {
        console.log('Payment modal closed:', data);
      }
    };

    const paymentResponse = await monnify.initiatePayment(paymentOptions);

    if (!paymentResponse?.checkoutUrl) {
      throw new Error("Failed to initialize payment");
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResponse.checkoutUrl,
      orderId: orderDoc._id,
      message: "Payment initiated successfully"
    });

  } catch (error: any) {
    console.error("Checkout error:", error);

    // Update order status if order was created
    if (error.orderId) {
      await Order.updateOne(
        { _id: error.orderId },
        { status: 'failed', error: error.message }
      ).catch(e => console.error("Failed to update order status:", e));
    }

    return NextResponse.json(
      { 
        success: false,
        error: error.message || "Checkout failed",
        message: "Please try again or contact support"
      },
      { status: 500 }
    );
  }
}

async function updateOrderStatus(orderId: string, status: string) {
  try {
    await Order.updateOne(
      { _id: orderId },
      { status, updatedAt: new Date() }
    );
  } catch (error) {
    console.error("Failed to update order status:", error);
  }
}