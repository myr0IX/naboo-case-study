import type { CityProps } from "@/components";
import { AxiosResponse } from "axios";
import { axiosInstance } from "./axios";

export function searchCity(search: string): Promise<CityResponse[]> {
  return axiosInstance
    .get(
      `/communes?nom=${search}&fields=departement&boost=population&limit=5`,
      { baseURL: "https://geo.api.gouv.fr", withCredentials: false }
    )
    .then((response: AxiosResponse<CityResponse[]>) => response.data);
}

interface CityResponse {
  nom: string;
}