import axios from "axios";
import axiosRetry from "axios-retry";
import { loginFactory } from "./login";
import { Collection, CollectionRequestParams } from "~/types/api/collection";
import { createCollectionFactory } from "~/api/createCollection";
import { updateCollectionFactory } from "~/api/updateCollection";

export interface UseApiProps {
  node: string;
  applicationKey: string;
}

export interface UseApi {
  login: () => Promise<string>;
  createCollection: (data: CollectionRequestParams) => Promise<Collection>;
  updateCollection: (repositoryId: string, data: CollectionRequestParams) => Promise<Collection>;
}

// cache
const clientMap: Map<string, UseApi> = new Map<string, UseApi>();

export const useApi = ({ node, applicationKey }: UseApiProps): UseApi => {
  if (!clientMap.has(applicationKey)) {
    const axiosInstance: any = axios.create({
      baseURL: `${node}/;/ccadmin/v1`.replace(/\/+;\/+/i, "/"),
    });

    axiosRetry(axiosInstance, { retries: 3 });

    clientMap.set(applicationKey, {
      login: loginFactory(axiosInstance, applicationKey),
      createCollection: createCollectionFactory(axiosInstance),
      updateCollection: updateCollectionFactory(axiosInstance),
    });
  }
  return clientMap.get(applicationKey) as UseApi;
};
