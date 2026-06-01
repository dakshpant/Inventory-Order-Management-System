import api from "../api/interceptor";
import { Product } from "../types";

export const ProductService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get("/products");
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (payload: Omit<Product, "id">): Promise<Product> => {
    const { data } = await api.post("/products", payload);

    return data;
  },

  update: async (
    id: string,
    payload: Omit<Product, "id">,
  ): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, payload);

    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
