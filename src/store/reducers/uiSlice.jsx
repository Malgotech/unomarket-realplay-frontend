import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    showLoginDialog: false,
  },
  reducers: {
    setShowLoginDialog: (state, action) => {
      state.showLoginDialog = action.payload;
    },
  },
});

export const { setShowLoginDialog } = uiSlice.actions;
export default uiSlice.reducer;
