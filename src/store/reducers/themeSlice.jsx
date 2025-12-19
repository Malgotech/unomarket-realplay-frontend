// src/store/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Get the saved theme from localStorage or default to 'light'
const getSavedTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  return savedTheme || 'light';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    value: getSavedTheme(), // Use the saved theme or default
  },
  reducers: {
    toggleTheme: (state) => {
      state.value = state.value === 'light' ? 'dark' : 'light';
      // Save to localStorage whenever theme changes
      localStorage.setItem('theme', state.value);
    },
    setTheme: (state, action) => {
      state.value = action.payload;
      // Save to localStorage when theme is explicitly set
      localStorage.setItem('theme', action.payload);
    }
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;