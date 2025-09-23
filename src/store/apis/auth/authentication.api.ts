import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const AuthenticationApi = createApi({
  reducerPath: "AuthenticationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
    prepareHeaders: (headers, api) => {
      const token = localStorage.getItem("access");
      if (token && api.endpoint != "login") {
        const userParsed = JSON.parse(token);
        headers.set("authorization", `Bearer ${userParsed}`);
      }

      return headers;
    },
  }),
  endpoints: () => ({
    // login: builder.mutation<LoginResponse, LoginCredentials>({
    //   query: (data) => {
    //     return {
    //       url: `auth/login/`,
    //       method: "POST",
    //       body: data,
    //       headers: {
    //         authorization: "",
    //       },
    //     };
    //   },
    // }),
    // getUserProfile: builder.query<User, void>({
    //   query: () => "auth/get-user-profile/",
    // }),
    // getSingleUser: builder.query<User, string>({
    //   query: (id) => `auth/get_user/${id}/`,
    // }),
    // getUsers: builder.query<User[], void>({
    //   query: () => "auth/users/",
    // }),
    // lockUser: builder.mutation<User, string>({
    //   query: (id) => {
    //     return {
    //       method: "POST",
    //       url: `auth/lock_user/${id}/`,
    //     };
    //   },
    // }),
    // unlockUser: builder.mutation<User, string>({
    //   query: (id) => {
    //     return {
    //       method: "POST",
    //       url: `auth/unlock_user/${id}/`,
    //     };
    //   },
    // }),
    // createUser: builder.mutation<any, CreateUserType>({
    //   query: (data) => ({
    //     url: "auth/users/",
    //     method: "POST",
    //     body: data,
    //   }),
    // }),
    // createContributorUser: builder.mutation<any, CreateUserType2>({
    //   query: (data) => ({
    //     url: "auth/users-contributor/",
    //     method: "POST",
    //     body: data,
    //   }),
    // }),
    // updateUser: builder.mutation<
    //   any,
    //   { id: string; data: Partial<CreateUserType> }
    // >({
    //   query: ({ data, id }) => ({
    //     url: `auth/update_user/${id}/`,
    //     method: "PUT",
    //     body: data,
    //   }),
    // }),
    // resetPasswordGetToken: builder.mutation<any, { email: string }>({
    //   query: (email) => {
    //     return {
    //       url: `auth/reset_password_get_token/`,
    //       method: "POST",
    //       body: email,
    //     };
    //   },
    // }),
    // resetPassword: builder.mutation<
    //   any,
    //   { uidb64: string; token: string; body: ResetPassword }
    // >({
    //   query: ({ uidb64, token, body }) => {
    //     return {
    //       url: `auth/reset_password_confirm/${uidb64}/${token}/`,
    //       method: "POST",
    //       body: body,
    //     };
    //   },
    // }),
    // getNotifications: builder.query<NotificationInterface[], void>({
    //   query: () => "administratif/notifications/",
    // }),
  }),
});

export const {
  // useLoginMutation,
  // useGetUserProfileQuery,
  // useLazyGetUserProfileQuery,
  // useCreateUserMutation,
  // useGetUsersQuery,
  // useUpdateUserMutation,
  // useGetSingleUserQuery,
  // useLockUserMutation,
  // useUnlockUserMutation,
  // useCreateContributorUserMutation,
  // useResetPasswordGetTokenMutation,
  // useResetPasswordMutation,
  // useGetNotificationsQuery,
} = AuthenticationApi;
