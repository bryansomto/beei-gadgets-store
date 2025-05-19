// types/monnify-js/index.d.ts
declare module 'monnify-js' {
  interface MonnifyPaymentOptions {
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
    onLoadStart?: () => void;
    onLoadComplete?: () => void;
  }

  interface MonnifyPaymentResponse {
    checkoutUrl: string;
    transactionReference: string;
    paymentReference: string;
  }

  class Monnify {
    constructor(apiKey: string, contractCode: string);
    initiatePayment(options: MonnifyPaymentOptions): Promise<MonnifyPaymentResponse>;
  }

  export = Monnify;
}