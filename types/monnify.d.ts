declare module 'monnify-js' {
  interface PaymentOptions {
    amount: number;
    currency: string;
    reference: string;
    paymentDescription: string;
    customerFullName: string;
    customerEmail: string;
    paymentMethods: string[];
    redirectUrl: string;
    onComplete?: (response: any) => void;
    onClose?: (data: any) => void;
  }

  class Monnify {
    constructor(apiKey: string, contractCode: string);
    initializePayment(options: PaymentOptions): Promise<{ checkoutUrl: string }>;
  }

  export = Monnify;
}