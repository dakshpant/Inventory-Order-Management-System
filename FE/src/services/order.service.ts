import api from "../api/interceptor";
import { Order } from "../types";

export interface CreateOrderPayload {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export const OrderService = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await api.get("/orders");
    return data;
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await api.get(`/orders/${id}`);

    return data;
  },

  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await api.post("/orders", payload);

    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};
