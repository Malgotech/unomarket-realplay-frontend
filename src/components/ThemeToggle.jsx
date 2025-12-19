// src/components/ThemeToggle.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../store/reducers/themeSlice';

const ThemeToggle = () => {
  const dispatch = useDispatch();
  return (
    <button onClick={() => dispatch(toggleTheme())}>Toggle Theme</button>
  );
};

export default ThemeToggle;