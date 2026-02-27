import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type AdoptionSummaryItem = {
  id: string;
  petName: string;
  petType: string;
  petBreed: string;
  petAge: number;
  status: string;
};

type AdoptionSummaryState = {
  items: AdoptionSummaryItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  isRefreshing: boolean;
  error: string | null;
};

const initialState: AdoptionSummaryState = {
  items: [],
  status: "idle",
  isRefreshing: false,
  error: null,
};

export const fetchAdoptionSummary = createAsyncThunk<
  AdoptionSummaryItem[],
  { page: number; limit: number },
  { rejectValue: string; state: { auth: { tokens: { accessToken: string } | null } } }
>("adoption/fetchSummary", async ({ page, limit }, { rejectWithValue, getState }) => {
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
    `${normalizedBaseUrl}/admin/adoptions/summary?page=${page}&limit=${limit}`,
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
      return rejectWithValue(
        errorBody?.message ?? "Failed to fetch adoption summary."
      );
    } catch {
      return rejectWithValue("Failed to fetch adoption summary.");
    }
  }

  const data = await response.json();
  const items = data?.data;

  if (!Array.isArray(items)) {
    return rejectWithValue("Invalid adoption summary response.");
  }

  return items.map((item: AdoptionSummaryItem & { _id?: string }) => ({
    id: item.id ?? item._id ?? "",
    petName: item.petName,
    petType: item.petType,
    petBreed: item.petBreed,
    petAge: item.petAge,
    status: item.status,
  }));
});

const adoptionSlice = createSlice({
  name: "adoption",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdoptionSummary.pending, (state) => {
        state.error = null;
        if (state.items.length > 0) {
          state.isRefreshing = true;
          state.status = "succeeded";
          return;
        }
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdoptionSummary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isRefreshing = false;
        state.items = action.payload;
      })
      .addCase(fetchAdoptionSummary.rejected, (state, action) => {
        state.isRefreshing = false;
        state.status = state.items.length > 0 ? "succeeded" : "failed";
        state.error = action.payload ?? "Failed to fetch adoption summary.";
      });
  },
});

export default adoptionSlice.reducer;
