import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const CoreApi = createApi({
  reducerPath: "CoreApi",
  baseQuery: fetchBaseQuery({
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("access");
      if (token) {
        const userParsed = JSON.parse(token);
        headers.set("authorization", `Bearer ${userParsed}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    fetchFile: builder.query<Blob, string>({
      query: (path) => ({
        url: path,
        responseHandler: async (response) => {
          return await response.blob();
          // return blob
        },
        headers: {},
      }),
    }),
  }),
});

export const { useFetchFileQuery, useLazyFetchFileQuery } = CoreApi;
