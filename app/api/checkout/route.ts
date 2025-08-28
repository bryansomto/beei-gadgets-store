import { MonnifyService } from '@/lib/services/monnify'
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from 'next/server';


interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CreateOrderRequest {
  userEmail: string;
  userName: string;
  phoneNumber: string;
  items: OrderItem[];
  total: number;
  address: Address;
}

export async function GET() {
  try {
    await mongooseConnect();
    const orders = await Order.find().sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
      const session = await auth();
      const { userEmail, userName, phoneNumber, items, total, address }: CreateOrderRequest = await req.json();
  
      if (!session?.user?.email || session.user.email !== userEmail) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
  
      if (!items?.length || total <= 0 || !address) {
        return NextResponse.json(
          { error: "Invalid order data" },
          { status: 400 }
        );
      }

    // Create Order
    const order = new Order({
      userEmail,
      userName,
      phoneNumber,
      total,
      address,
      status: "pending",
      paid: false,
    }) as InstanceType<typeof Order>;

    console.log("Order created:", order);

    // Initialize Payment
    if (!process.env.MONNIFY_API_KEY || !process.env.MONNIFY_CONTRACT_CODE) {
      throw new Error("Payment configuration error");
    }

    function getRequiredEnvVar(name: string): string {
      const value = process.env[name];
      if (!value?.trim()) {
        throw new Error(`Missing required environment variable: ${name}`);
      }
      return value.trim();
    }

    const monnify = (() => {
      try {
        return new MonnifyService({
          apiKey: getRequiredEnvVar('MONNIFY_API_KEY'),
          secretKey: getRequiredEnvVar('MONNIFY_SECRET_KEY'),
          contractCode: getRequiredEnvVar('MONNIFY_CONTRACT_CODE'),
          baseUrl: process.env.MONNIFY_BASE_URL?.trim() // Optional
        });
      } catch (error) {
        console.error('Failed to initialize Monnify:', error);
        // Handle error appropriately (e.g., disable payment functionality)
        throw error; // or return a mock service for development
      }
    })();

    const paymentResponse = await monnify.initializePayment({
      amount: total,
      customerFullName: userName,
      customerEmail: userEmail,
      customerPhoneNumber: phoneNumber,
      currency: "NGN",
      paymentReference: `order_${order._id}_${Date.now()}`,
      paymentDescription: `Order #${order._id}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_URL}/checkout/success?orderId=${order._id}`
    });

    if (!paymentResponse?.checkoutUrl) {
      throw new Error("Failed to initialize payment");
    }

    return NextResponse.json({
      success: true,
      paymentUrl: paymentResponse.checkoutUrl,
      orderId: order._id,
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