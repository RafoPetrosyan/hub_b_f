import { User, UsersState } from '@/store/auth/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: UsersState = {
  currentUser: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.currentUser = action.payload;
    },
  },
});

export const { setCurrentUser } = authSlice.actions;
export default authSlice.reducer;
