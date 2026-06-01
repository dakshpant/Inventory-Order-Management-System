import api from "../api/interceptor";
export const ProductService = {
    getAll: async () => {
        const { data } = await api.get("/products");
        return data;
    },
    getById: async (id) => {
        const { data } = await api.get(`/products/${id}`);
        return data;
    },
    create: async (payload) => {
        const { data } = await api.post("/products", payload);
        return data;
    },
    update: async (id, payload) => {
        const { data } = await api.put(`/products/${id}`, payload);
        return data;
    },
    delete: async (id) => {
        await api.delete(`/products/${id}`);
    },
};
