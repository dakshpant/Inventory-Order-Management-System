import api from "../api/interceptor";
export const StatsService = {
    get: async (lowStockThreshold = 10) => {
        const { data } = await api.get(`/stats?lowStockThreshold=${lowStockThreshold}`);
        return data;
    },
};
