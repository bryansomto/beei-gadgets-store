// // __tests__/adminApi.test.ts
// import { DELETE } from "@/app/api/admins/DELETE";
// import { GET } from "@/app/api/admins/GET";
// import { POST } from "@/app/api/admins/POST";
// import { mongooseConnect } from "@/lib/mongoose";
// import { Admin } from "@/models/Admin";

// // Mock dependencies
// jest.mock('@/lib/mongoose', () => ({ mongooseConnect: jest.fn() }));
// jest.mock('@/models/Admin', () => ({
//   Admin: {
//     find: jest.fn(),
//     findOne: jest.fn(),
//     create: jest.fn(),
//     deleteOne: jest.fn(),
//   },
// }));

// describe('Admin API routes', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('GET', () => {
//     it('should return list of admins', async () => {
//       (Admin.find as jest.Mock).mockResolvedValue([{ email: 'admin@example.com' }]);

//       const res = await GET();
//       const data = await res.json();

//       expect(res.status).toBe(200);
//       expect(data).toEqual([{ email: 'admin@example.com' }]);
//     });
//   });

//   describe('POST', () => {
//     const mockReq = (body: any) => ({ json: async () => body });

//     it('should create a new admin', async () => {
//       (Admin.findOne as jest.Mock).mockResolvedValue(null);
//       (Admin.create as jest.Mock).mockResolvedValue({ email: 'admin@example.com' });

//       const res = await POST(mockReq({ email: 'admin@example.com' }) as any);
//       const data = await res.json();

//       expect(res.status).toBe(201);
//       expect(data.email).toBe('admin@example.com');
//     });

//     it('should return 400 if email is missing', async () => {
//       const res = await POST(mockReq({}) as any);
//       const data = await res.json();

//       expect(res.status).toBe(400);
//       expect(data.error).toBe('Email is required');
//     });

//     it('should return 409 if admin exists', async () => {
//       (Admin.findOne as jest.Mock).mockResolvedValue({ email: 'admin@example.com' });

//       const res = await POST(mockReq({ email: 'admin@example.com' }) as any);
//       const data = await res.json();

//       expect(res.status).toBe(409);
//       expect(data.error).toBe('Email already exists');
//     });
//   });

//   describe('DELETE', () => {
//     const mockReq = (body: any) => ({ json: async () => body });

//     it('should delete an admin by email', async () => {
//       (Admin.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

//       const res = await DELETE(mockReq({ email: 'admin@example.com' }) as any);
//       const data = await res.json();

//       expect(res.status).toBe(200);
//       expect(data.message).toBe('Admin deleted successfully');
//     });

//     it('should return 400 if email is missing', async () => {
//       const res = await DELETE(mockReq({}) as any);
//       const data = await res.json();

//       expect(res.status).toBe(400);
//       expect(data.error).toBe('Email is required');
//     });
//   });
// });
