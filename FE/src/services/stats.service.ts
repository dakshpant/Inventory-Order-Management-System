import api from "../api/interceptor";
import { SystemStats } from "../types";

export const StatsService = {
  get: async (lowStockThreshold = 10): Promise<SystemStats> => {
    const { data } = await api.get(
      `/stats?lowStockThreshold=${lowStockThreshold}`,
    );

    return data;
  },
};
