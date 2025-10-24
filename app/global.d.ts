declare global {
  interface PaystackPop {
    setup(options: {
      key: string;
      email: string;
      amount: number;
      ref: string;
      currency?: string;
      callback: (response: { reference: string }) => void;
      onClose: () => void;
    }): {
      openIframe: () => void;
    };
  }

  interface Window {
    PaystackPop?: PaystackPop;
  }
}

export {};
