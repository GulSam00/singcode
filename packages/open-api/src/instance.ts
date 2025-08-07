import axios, { AxiosInstance, AxiosResponse } from "axios";
import type { Brand, Period, ResponseType, InstanceResponse } from "./types";

export const isValidBrand = (brand: string): brand is Brand => {
  return ["kumyoung", "tj", "dam", "joysound"].includes(brand);
};

export const isValidPeriod = (period: string): period is Period => {
  return ["daily", "weekly", "monthly"].includes(period);
};

export const instance = axios.create({
  baseURL: "https://api.manana.kr/karaoke",
  headers: {
    "Content-Type": "application/json",
  },
});

const createApiRequest = (instance: AxiosInstance) => {
  return async (
    path: string,
    param: string,
    brand?: Brand
  ): Promise<InstanceResponse> => {
    try {
      // brand 유효성 검사
      if (brand && !isValidBrand(brand)) {
        throw new Error("Invalid brand type");
      }

      // brand가 있는 경우 path 수정
      const finalPath = brand
        ? `${path}/${param}/${brand}.json`
        : `${path}/${param}.json`;

      const response: AxiosResponse<ResponseType[]> =
        await instance.get(finalPath);

      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      console.error("API Request Error:", error);
      return {
        data: null,
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  };
};

export const apiRequest = createApiRequest(instance);

export default instance;
