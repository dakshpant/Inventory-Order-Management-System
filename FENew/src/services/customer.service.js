import api from "../api/interceptor";
export const CustomerService = {
    getAll: async () => {
        const { data } = await api.get("/customers");
        return data;
    },
    getById: async (id) => {
        const { data } = await api.get(`/customers/${id}`);
        return data;
    },
    create: async (payload) => {
        const { data } = await api.post("/customers", payload);
        return data;
    },
    delete: async (id) => {
        await api.delete(`/customers/${id}`);
    },
};
