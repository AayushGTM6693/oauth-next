import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  endpoints: (builder) => ({
    getSession: builder.query<any, void>({
      query: () => "auth/session",
    }),
  }),
});

export const { useGetSessionQuery } = api;
