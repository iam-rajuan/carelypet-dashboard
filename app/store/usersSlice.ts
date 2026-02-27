import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type UserRecord = {
  id: string;
  name: string;
  username: string;
  email: string;
  status: string;
  deletionRequestedAt: string | null;
  daysLeft: number | null;
  createdAt: string;
};

type UsersState = {
  users: UserRecord[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: UsersState = {
  users: [],
  status: "idle",
  error: null,
};

export const fetchUsers = createAsyncThunk<
  UserRecord[],
  { page: number; limit: number },
  { rejectValue: string; state: { auth: { tokens: { accessToken: string } | null } } }
>("users/fetchUsers", async ({ page, limit }, { rejectWithValue, getState }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  if (!normalizedBaseUrl) {
    return rejectWithValue("NEXT_PUBLIC_API_BASE_URL is not set.");
  }

  const accessToken = getState().auth.tokens?.accessToken;
  if (!accessToken) {
    return rejectWithValue("Missing access token.");
  }

  const response = await fetch(
    `${normalizedBaseUrl}/admin/users?page=${page}&limit=${limit}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    try {
      const errorBody = await response.json();
      return rejectWithValue(errorBody?.message ?? "Failed to fetch users.");
    } catch {
      return rejectWithValue("Failed to fetch users.");
    }
  }

  const data = await response.json();
  const users = data?.data;

  if (!Array.isArray(users)) {
    return rejectWithValue("Invalid users response.");
  }

  return users.map((user: UserRecord & { _id?: string }) => ({
    id: user.id ?? user._id ?? "",
    name: user.name,
    username: user.username,
    email: user.email,
    status: user.status,
    deletionRequestedAt: user.deletionRequestedAt ?? null,
    daysLeft: user.daysLeft ?? null,
    createdAt: user.createdAt,
  }));
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch users.";
      });
  },
});

export default usersSlice.reducer;
