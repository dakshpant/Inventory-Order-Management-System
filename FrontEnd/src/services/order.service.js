import api from "../api/interceptor";
export const OrderService = {
    getAll: async () => {
        const { data } = await api.get("/orders");
        return data;
    },
    getById: async (id) => {
        const { data } = await api.get(`/orders/${id}`);
        return data;
    },
    create: async (payload) => {
        const { data } = await api.post("/orders", payload);
        return data;
    },
    delete: async (id) => {
        await api.delete(`/orders/${id}`);
    },
};
