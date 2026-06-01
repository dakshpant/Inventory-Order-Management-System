import api from "../api/interceptor";
import { Customer } from "../types";

export const CustomerService = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await api.get("/customers");
    return data;
  },

  getById: async (id: string): Promise<Customer> => {
    const { data } = await api.get(`/customers/${id}`);

    return data;
  },

  create: async (payload: Omit<Customer, "id">): Promise<Customer> => {
    const { data } = await api.post("/customers", payload);

    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};
