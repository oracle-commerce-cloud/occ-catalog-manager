import { useApi } from "~/api";
import mockAxios from "jest-mock-axios";

import collections from "../mock/collections.json";

const { node, applicationKey } = process.env || { node: "https://test.com", applicationKey: "hhhhh" };
const { createCollection } = useApi({ node, applicationKey });

describe("useApi.createCollection", () => {
  it("should be defined", async () => {
    expect(createCollection).toBeTruthy();
  });

  it("create collection using the admin api", async () => {
    const { locale, items } = collections;
    const collection = items[0];
    const catchFn = jest.fn((err: any) => console.trace(err));
    const thenFn = jest.fn();

    // using the component, which should make a server response

    const promise = createCollection({ language: locale, collection })
      .then(thenFn)
      .catch(catchFn);

    // since `post` method is a spy, we can check if the server request was correct
    // a) the correct method was used (post)
    // b) went to the correct Endpoint URL ('/layouts/${repositoryId}/structure')
    // c) if the payload was correct (grant_type, Authorization, Content-Type)
    expect(mockAxios.post).toHaveBeenCalledWith(`/collections/`, collection, {
      headers: { "x-ccasset-language": locale },
    });

    // simulating a server response
    mockAxios.mockResponse({ data: collection.properties });

    await promise;

    // checking the `then` spy has been called and if the
    // response from the server was converted to upper case
    expect(thenFn).toHaveBeenCalledWith(collection.properties);

    // catch should not have been called
    expect(catchFn).not.toHaveBeenCalled();
  });
});
