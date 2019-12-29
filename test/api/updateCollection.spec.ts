import { useApi } from "~/api";
import mockAxios from "jest-mock-axios";

import collections from "../mock/collections.json";

const { node, applicationKey } = process.env || { node: "https://test.com", applicationKey: "hhhhh" };
const { updateCollection } = useApi({ node, applicationKey });

describe("useApi.updateCollection", () => {
  it("should be defined", async () => {
    expect(updateCollection).toBeTruthy();
  });

  it("update collection by repositoryId using the admin api", async () => {
    const { locale, items } = collections;
    const repositoryId = items[0].properties.id;
    const catchFn = jest.fn((err: any) => console.trace(err));
    const thenFn = jest.fn();

    // using the component, which should make a server response

    const promise = updateCollection(repositoryId, { language: locale, collection: items[0] })
      .then(thenFn)
      .catch(catchFn);

    // since `post` method is a spy, we can check if the server request was correct
    // a) the correct method was used (post)
    // b) went to the correct Endpoint URL ('/layouts/${repositoryId}/structure')
    // c) if the payload was correct (grant_type, Authorization, Content-Type)
    expect(mockAxios.put).toHaveBeenCalledWith(`/collections/${repositoryId}`, items[0], { headers: { "x-ccasset-language": locale } });

    // simulating a server response
    mockAxios.mockResponse({ data: items[0].properties });

    await promise;

    // checking the `then` spy has been called and if the
    // response from the server was converted to upper case
    expect(thenFn).toHaveBeenCalledWith(items[0].properties);

    // catch should not have been called
    expect(catchFn).not.toHaveBeenCalled();
  });
});
