import { CollectionRequestParams } from "~/types/api/collection";

export const updateCollectionFactory = (axiosInstance: any) => async (
  repositoryId: string,
  { language, collection }: CollectionRequestParams,
) =>
  axiosInstance
    .put(`/collections/${repositoryId}`, collection, { headers: { "x-ccasset-language": language } })
    .then((resp: any) => resp.data);
