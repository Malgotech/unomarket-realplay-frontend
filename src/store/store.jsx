import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./reducers/themeSlice";
import uiReducer from "./reducers/uiSlice";
import  movieSlice from "./reducers/movieSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    ui: uiReducer,
    user:movieSlice
    
  },
});
