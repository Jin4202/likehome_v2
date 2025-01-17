import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createUser,
  getData,
  userExisted,
  updateUser,
  historyReservation,
} from "../../firebaseFunction";

export const createUserWithEmailAndPass = createAsyncThunk(
  "/user",
  async (userObj) => {
    let data = await userExisted(userObj);
    if (data) {
      alert("Account in used");
      return false;
    }
    data = await createUser(userObj);
    return true;
  }
);
export const loginUserWithEmailAndPass = createAsyncThunk(
  "user/loging",
  async (userObj) => {
    let data = await getData(userObj);
    return data;
  }
);

export const UpdateProfile = createAsyncThunk(
  "user/profile",
  async (objUser) => {
    let data = await updateUser(objUser);
    return data;
  }
);

export const reservationHist = createAsyncThunk(
  "user/profile/reservation",
  async (objUser) => {
    let data = await historyReservation(objUser);
    return data;
  }
);

const initialState = {
  user: {},
  signUp: {
    status: true,
  },
  login: {
    status: false,
  },
  reservationHist: {
    reservations: [],
    isLoading: true,
  },
  sameDayBooking: false,
};

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    reload: (state, action) => {
      state.signUp.status = true;
    },
    userSignOut: (state, action) => {
      state.login.status = false;
      state.signUp.status = true;
      state.user = {};
    },
    isBookingSameDay: (state, action) => {
      state.sameDayBooking = false;
      let temp = state.reservationHist.reservations;
      let dateObj = action.payload;

      if (dateObj) {
        let dateIn = `${dateObj.inMonth}/${dateObj.inDay}/${dateObj.inYear}`;
        let dateOut = `${dateObj.outMonth}/${dateObj.outDay}/${dateObj.outYear}`;
        let getTimeDateIn = new Date(dateIn).getTime();
        let getTimeDateOut = new Date(dateOut).getTime();
        temp.map((data) => {
          let getTimeHisIn = new Date(data.date[0]).getTime();
          let getTimeHisOut = new Date(data.date[1]).getTime();
          if (getTimeDateIn > getTimeHisIn && getTimeDateIn < getTimeHisOut) {
            state.sameDayBooking = true;
            return
          }
          if (
            getTimeDateOut > getTimeHisIn &&
            getTimeDateOut < getTimeHisOut
          ) {
            state.sameDayBooking = true;
            return
          }
        });
      }
    },
    reloadBookingSameDay: (state, action) => {
      state.reservationHist.isLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createUserWithEmailAndPass.fulfilled, (state, action) => {
      if (action.payload) state.signUp.status = action.payload;
    });
    builder.addCase(loginUserWithEmailAndPass.fulfilled, (state, action) => {
      if (action.payload) state.login.status = true;
      state.signUp.status = false;
      state.user = action.payload;
    });
    builder.addCase(UpdateProfile.fulfilled, (state, action) => {
      if (action.payload) state.login.status = true;
      state.user = action.payload;
    });
    builder.addCase(reservationHist.fulfilled, (state, action) => {
      if (action.payload) state.reservationHist.isLoading = false;
      state.reservationHist.reservations = action.payload;
    });
  },
});

export const { reload, userSignOut, isBookingSameDay, reloadBookingSameDay } =
  accountSlice.actions;

export default accountSlice.reducer;
