import { CollectionRequestParams } from "~/types/api/collection";

export const createCollectionFactory = (axiosInstance: any) => ({ language, collection }: CollectionRequestParams) =>
  axiosInstance
    .post(`/collections/`, collection, { headers: { "x-ccasset-language": language } })
    .then((resp: any) => resp.data);
