import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type AdoptionRequestListItem = {
  id: string;
  listingId: string;
  customerId?: string | null;
  customerName?: string | null;
  petType: string;
  petBreed: string;
  petAge: number;
  status: string;
};

export type AdoptionRequestDetail = {
  id: string;
  status: string;
  orderId: string;
  orderDate: string;
  customer: {
    id?: string | null;
    name?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  listing: {
    id: string;
    petName: string;
    petType: string;
    petBreed: string;
    petAge: number;
    petGender?: string | null;
    avatarUrl?: string | null;
    photos?: string[] | null;
    status?: string | null;
  };
};

type AdoptionRequestsState = {
  items: AdoptionRequestListItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  detail: AdoptionRequestDetail | null;
  detailStatus: "idle" | "loading" | "succeeded" | "failed";
  detailError: string | null;
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
  updateError: string | null;
  deleteStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteError: string | null;
};

const initialState: AdoptionRequestsState = {
  items: [],
  status: "idle",
  error: null,
  detail: null,
  detailStatus: "idle",
  detailError: null,
  updateStatus: "idle",
  updateError: null,
  deleteStatus: "idle",
  deleteError: null,
};

type ThunkState = {
  auth: {
    tokens: {
      accessToken: string;
    } | null;
  };
};

export const fetchAdoptionRequests = createAsyncThunk<
  AdoptionRequestListItem[],
  { status?: string },
  { rejectValue: string; state: ThunkState }
>("adoptionRequests/fetchAll", async ({ status }, { rejectWithValue, getState }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  if (!normalizedBaseUrl) {
    return rejectWithValue("NEXT_PUBLIC_API_BASE_URL is not set.");
  }

  const accessToken = getState().auth.tokens?.accessToken;
  if (!accessToken) {
    return rejectWithValue("Missing access token.");
  }

  const query = status ? `?status=${status}` : "?status=all";
  const response = await fetch(
    `${normalizedBaseUrl}/admin/adoptions/requests${query}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    try {
      const errorBody = await response.json();
      return rejectWithValue(
        errorBody?.message ?? "Failed to fetch adoption requests.",
      );
    } catch {
      return rejectWithValue("Failed to fetch adoption requests.");
    }
  }

  const data = await response.json();
  const items = data?.data;

  if (!Array.isArray(items)) {
    return rejectWithValue("Invalid adoption requests response.");
  }

  return items.map(
    (item: AdoptionRequestListItem & { _id?: string }) => ({
      id: item.id ?? item._id ?? "",
      listingId: item.listingId,
      customerId: item.customerId,
      customerName: item.customerName,
      petType: item.petType,
      petBreed: item.petBreed,
      petAge: item.petAge,
      status: item.status,
    }),
  );
});

export const fetchAdoptionRequestDetail = createAsyncThunk<
  AdoptionRequestDetail,
  { id: string },
  { rejectValue: string; state: ThunkState }
>(
  "adoptionRequests/fetchDetail",
  async ({ id }, { rejectWithValue, getState }) => {
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
      `${normalizedBaseUrl}/admin/adoptions/requests/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      try {
        const errorBody = await response.json();
        return rejectWithValue(
          errorBody?.message ?? "Failed to fetch adoption request details.",
        );
      } catch {
        return rejectWithValue("Failed to fetch adoption request details.");
      }
    }

    const data = await response.json();
    const detail = data?.data;

    if (!detail || typeof detail !== "object") {
      return rejectWithValue("Invalid adoption request detail response.");
    }

    return {
      id: detail.id,
      status: detail.status,
      orderId: detail.orderId,
      orderDate: detail.orderDate,
      customer: detail.customer ?? {},
      listing: detail.listing ?? {},
    } as AdoptionRequestDetail;
  },
);

export const updateAdoptionRequestStatus = createAsyncThunk<
  { id: string; status: string },
  { id: string; status: string },
  { rejectValue: string; state: ThunkState }
>(
  "adoptionRequests/updateStatus",
  async ({ id, status }, { rejectWithValue, getState }) => {
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
      `${normalizedBaseUrl}/admin/adoptions/requests/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      },
    );

    if (!response.ok) {
      try {
        const errorBody = await response.json();
        return rejectWithValue(
          errorBody?.message ?? "Failed to update request status.",
        );
      } catch {
        return rejectWithValue("Failed to update request status.");
      }
    }

    return { id, status };
  },
);

export const deleteAdoptionRequest = createAsyncThunk<
  { id: string },
  { id: string },
  { rejectValue: string; state: ThunkState }
>(
  "adoptionRequests/delete",
  async ({ id }, { rejectWithValue, getState }) => {
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
      `${normalizedBaseUrl}/admin/adoptions/requests/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      try {
        const errorBody = await response.json();
        return rejectWithValue(
          errorBody?.message ?? "Failed to delete adoption request.",
        );
      } catch {
        return rejectWithValue("Failed to delete adoption request.");
      }
    }

    return { id };
  },
);

const adoptionRequestsSlice = createSlice({
  name: "adoptionRequests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdoptionRequests.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAdoptionRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAdoptionRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch adoption requests.";
      })
      .addCase(fetchAdoptionRequestDetail.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(fetchAdoptionRequestDetail.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        state.detail = action.payload;
      })
      .addCase(fetchAdoptionRequestDetail.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError =
          action.payload ?? "Failed to fetch adoption request details.";
      })
      .addCase(updateAdoptionRequestStatus.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateAdoptionRequestStatus.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const { id, status } = action.payload;
        const item = state.items.find((entry) => entry.id === id);
        if (item) {
          item.status = status;
        }
        if (state.detail?.id === id) {
          state.detail.status = status;
        }
      })
      .addCase(updateAdoptionRequestStatus.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload ?? "Failed to update request status.";
      })
      .addCase(deleteAdoptionRequest.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteAdoptionRequest.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.items = state.items.filter(
          (entry) => entry.id !== action.payload.id,
        );
        if (state.detail?.id === action.payload.id) {
          state.detail = null;
          state.detailStatus = "idle";
        }
      })
      .addCase(deleteAdoptionRequest.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload ?? "Failed to delete adoption request.";
      });
  },
});

export default adoptionRequestsSlice.reducer;
