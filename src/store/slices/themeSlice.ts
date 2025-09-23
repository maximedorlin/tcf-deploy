import { createSlice } from "@reduxjs/toolkit";

interface themeState {
  navOpen: boolean;
  navExpend: boolean;
}

const initialState: themeState = {
  navOpen: true,
  navExpend: false,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toogleNavOpen: (state) => {
      state.navOpen = !state.navOpen;
      return state;
    },
    toogleNavExpend: (state) => {
      state.navExpend = !state.navExpend;
      return state;
    },
  },
});

export const { toogleNavExpend, toogleNavOpen } = themeSlice.actions;

export default themeSlice.reducer;
