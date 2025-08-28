// lib/services/monnify.ts
import axios, { AxiosError, AxiosResponse } from 'axios';

interface MonnifyConfig {
  apiKey: string;
  secretKey: string;
  contractCode: string;
  baseUrl?: string;
}

interface PaymentRequest {
  amount: number;
  customerFullName: string;
  customerEmail: string;
  customerPhoneNumber: string;
  paymentReference: string;
  paymentDescription: string;
  currency?: string;
  redirectUrl: string;
}

interface PaymentResponse {
  checkoutUrl: string;
  transactionReference: string;
}

interface MonnifyAuthResponse {
  requestSuccessful: boolean;
  responseMessage?: string;
  responseCode?: string;
  responseBody?: {
    accessToken: string;
    expiresIn: number;
  };
}

interface MonnifyPaymentSuccessResponse {
  requestSuccessful: boolean;
  responseMessage?: string;
  responseBody: {
    checkoutUrl: string;
    transactionReference: string;
  };
}

interface MonnifyErrorResponse {
  requestSuccessful: boolean;
  responseMessage?: string;
  responseCode?: string;
}

export class MonnifyService {
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly contractCode: string;
  private readonly baseUrl: string;

  constructor(config: MonnifyConfig) {
    if (!config.apiKey || !config.secretKey || !config.contractCode) {
      throw new Error('Monnify API key, secret key, and contract code are required');
    }

    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.contractCode = config.contractCode;
    this.baseUrl = config.baseUrl 
      || process.env.MONNIFY_BASE_URL
      || (process.env.NODE_ENV === 'production'
          ? 'https://api.monnify.com'
          : 'https://sandbox.monnify.com');

    console.log('Monnify config:', {
      apiKey: this.apiKey,
      secretKey: this.secretKey ? '[REDACTED]' : 'MISSING',
      contractCode: this.contractCode,
      baseUrl: this.baseUrl
    });
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('Using Monnify Base URL:', this.baseUrl);

  }

  

private async getAccessToken(): Promise<string> {
  try {
    // Create Basic Auth token
    const authString = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');

    const response = await axios.post<MonnifyAuthResponse>(
      `${this.baseUrl}/api/v1/auth/login`,
      {},
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    if (!response.data.responseBody?.accessToken) {
      console.error('Auth response:', response.data);
      throw new Error(response.data.responseMessage || 'Invalid auth response structure');
    }

    return response.data.responseBody.accessToken;
  } catch (error) {
    if (axios.isAxiosError<MonnifyErrorResponse>(error)) {
      const errorData = error.response?.data;
      console.error('🔴 Full Axios Error:', {
        isAxiosError: true,
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response,
      });

      throw new Error(
        errorData?.responseMessage || 
        error.response?.status 
          ? `Authentication failed with status ${error.response?.status}` 
          : `No response received from Monnify: ${error.message}`
      );
    }

    console.error('🔴 Non-Axios Error:', error);
    throw new Error('Monnify authentication failed: Unknown error');
  }

}

  async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Validate request
      if (!request.amount || request.amount <= 0) {
        throw new Error('Invalid payment amount');
      }
      if (!request.customerEmail || !request.customerFullName) {
        throw new Error('Customer information is required');
      }

      const accessToken = await this.getAccessToken();

      const payload = {
        amount: Number(request.amount.toFixed(2)),
        customerFullName: request.customerFullName.substring(0, 100),
        customerEmail: request.customerEmail,
        customerPhoneNumber: request.customerPhoneNumber?.substring(0, 15),
        paymentReference: request.paymentReference.substring(0, 100),
        paymentDescription: request.paymentDescription.substring(0, 200),
        currency: request.currency || 'NGN',
        redirectUrl: request.redirectUrl,
        contractCode: this.contractCode,
        paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
      };

      console.log('🟢 Monnify Payment Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post<MonnifyPaymentSuccessResponse>(
        `${this.baseUrl}/api/v1/merchant/transactions/init-transaction`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        }
      );

      if (!response.data.responseBody?.checkoutUrl) {
         console.error('❌ Monnify response missing checkoutUrl:', JSON.stringify(response.data, null, 2));
        throw new Error(response.data.responseMessage || 'Invalid response from Monnify');
      }

      return {
        checkoutUrl: response.data.responseBody.checkoutUrl,
        transactionReference: response.data.responseBody.transactionReference
      };
    } catch (error) {
      if (axios.isAxiosError<MonnifyErrorResponse>(error)) {
        const response = error.response;

      // Log full error response
      console.error('❌ Monnify Axios Error:', {
        status: response?.status,
        headers: response?.headers,
        data: response?.data,
        message: error.message
      });
      console.error('🔥 Raw error:', JSON.stringify(error, null, 2));
      console.error('🔥 Axios response:', error.response?.data);
        const errorMessage = error.response?.data?.responseMessage || 
                          error.message || 
                          'Payment initialization failed';
                          
        throw new Error(`Monnify payment failed: ${errorMessage}`);
      }
      console.error('❌ Unknown error in initializePayment:', error);
      throw error instanceof Error ? error : new Error('Unknown payment error');
    }
  }
}