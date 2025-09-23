// import { User } from "@/interfaces/auth/logininterfaces";
import { createSlice } from "@reduxjs/toolkit";

// const initialState2: User = {
//   id: "",
//   is_superuser: false,
//   username: "",
//   is_staff: false,
//   is_active: false,
//   last_name: "",
//   email: "",
//   groups: [],
//   user_permissions: undefined,
//   last_login: "",
//   date_joined: "",
//   first_name: "",
//   otp: "",
//   phone_number: "",
//   level: "",
//   is_bloqued: false,
// };

// interface State {
//   user: User;
//   isLoggedIn: boolean;
// }

// const initialState: State = {
//   user: initialState2,
//   isLoggedIn: false,
// };

const authSlice = createSlice({
  name: "auth",
  // initialState,
  initialState: {},
  reducers: {
    loginSuccess: (state) => {
      // state = { ...action.payload, isLoggedIn: true };
      return state;
    },
    logout: (state) => {
      // state = { ...initialState, isLoggedIn: false };
      return state;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
