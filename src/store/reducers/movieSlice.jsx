import { createSlice } from "@reduxjs/toolkit";
import { fetchData } from "../../services/apiServices";
const getLocalData = (key) => {
  try {
    let data = localStorage.getItem(key);
    data = JSON.parse(data);
    return data;
  } catch (err) {
    return undefined;
  }
};
const initialState = {
  info: null,
  isLogin: getLocalData("UnomarketToken") === null ? false : true,
  userData: {},
};
export const movieSlice = createSlice({
  name: "movie",
  initialState,
  reducers: {
    loadmovie: (state, action) => {
      state.info = action.payload;
    },
    removemovie: (state, action) => {
      state.info = null;
    },
    setLoginStatus: (state, action) => {
      state.isLogin = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
  },
});

export const { loadmovie, removemovie, setLoginStatus, setUserData } =
  movieSlice.actions;
export default movieSlice.reducer;

export const UserMetamaskApi =
  (data, type, callback = () => {}) =>
  async (dispatch) => {
    try {
      const myData = await Loginhelper(data, type);
      const response = await apiHelper.postRequest(
        "v1/auth/web3connect",
        myData
      );

      callback(response);
      if (response.status) {
        dispatch(setLoginStatus(true));
        return response;
      } else {
        dispatch(setLoginStatus(false));
      }
    } catch (e) {
      console.log(e);
      dispatch(setLoginStatus(false));
    }
  };
export const userDataAPI =
  (callback = () => {}) =>
  async (dispatch) => {
    try {
      const response = await fetchData("api/event/user");
      callback();
      if (response.success) {

        dispatch(setUserData(response));
        return response;
      }
    } catch (e) {
      console.log(e);
    }
  };
export const userLoginDispatch = () => async (dispatch) => {
  try {
    dispatch(setLoginStatus(true));
  } catch (e) {
    console.log(e);
    dispatch(setLoginStatus(false));
  }
};
