import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type PetType = {
  id: string;
  name: string;
  slug: string;
  petBreedCount?: number;
};

type PetState = {
  petTypes: PetType[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  createError: string | null;
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
  updateError: string | null;
  deleteStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteError: string | null;
};

const initialState: PetState = {
  petTypes: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  updateStatus: "idle",
  updateError: null,
  deleteStatus: "idle",
  deleteError: null,
};

export const fetchPetTypes = createAsyncThunk<
  PetType[],
  void,
  { rejectValue: string; state: { auth: { tokens: { accessToken: string } | null } } }
>("pet/fetchPetTypes", async (_, { rejectWithValue, getState }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  if (!normalizedBaseUrl) {
    return rejectWithValue("NEXT_PUBLIC_API_BASE_URL is not set.");
  }

  const accessToken = getState().auth.tokens?.accessToken;
  if (!accessToken) {
    return rejectWithValue("Missing access token.");
  }

  const response = await fetch(`${normalizedBaseUrl}/admin/pet-types`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    try {
      const errorBody = await response.json();
      return rejectWithValue(errorBody?.message ?? "Failed to fetch pet types.");
    } catch {
      return rejectWithValue("Failed to fetch pet types.");
    }
  }

  const data = await response.json();
  const petTypes = data?.data;

  if (!Array.isArray(petTypes)) {
    return rejectWithValue("Invalid pet types response.");
  }

  return petTypes.map((petType: PetType & { _id?: string }) => ({
    id: petType.id ?? petType._id ?? "",
    name: petType.name,
    slug: petType.slug,
    petBreedCount: petType.petBreedCount ?? 0,
  }));
});

export const createPetType = createAsyncThunk<
  PetType,
  { name: string },
  { rejectValue: string; state: { auth: { tokens: { accessToken: string } | null } } }
>("pet/createPetType", async (payload, { rejectWithValue, getState }) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  if (!normalizedBaseUrl) {
    return rejectWithValue("NEXT_PUBLIC_API_BASE_URL is not set.");
  }

  const accessToken = getState().auth.tokens?.accessToken;
  if (!accessToken) {
    return rejectWithValue("Missing access token.");
  }

  const response = await fetch(`${normalizedBaseUrl}/admin/pet-types`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    try {
      const errorBody = await response.json();
      return rejectWithValue(
        errorBody?.message ?? "Failed to create pet type."
      );
    } catch {
      return rejectWithValue("Failed to create pet type.");
    }
  }

  const data = await response.json();
  const petType = data?.data;

  const mappedPetType = {
    id: petType?.id ?? petType?._id ?? "",
    name: petType?.name,
    slug: petType?.slug,
    petBreedCount: petType?.petBreedCount ?? 0,
  };

  if (!mappedPetType.id || !mappedPetType.name || !mappedPetType.slug) {
    return rejectWithValue("Invalid create pet type response.");
  }

  return mappedPetType;
});

export const updatePetType = createAsyncThunk<
  PetType,
  { id: string; name: string },
  { rejectValue: string; state: { auth: { tokens: { accessToken: string } | null } } }
>("pet/updatePetType", async (payload, { rejectWithValue, getState }) => {
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
    `${normalizedBaseUrl}/admin/pet-types/${payload.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name: payload.name }),
    }
  );

  if (!response.ok) {
    try {
      const errorBody = await response.json();
      return rejectWithValue(
        errorBody?.message ?? "Failed to update pet type."
      );
    } catch {
      return rejectWithValue("Failed to update pet type.");
    }
  }

  const data = await response.json();
  const petType = data?.data;
  const mappedPetType = {
    id: petType?.id ?? petType?._id ?? "",
    name: petType?.name,
    slug: petType?.slug,
    petBreedCount: petType?.petBreedCount ?? 0,
  };

  if (!mappedPetType.id || !mappedPetType.name || !mappedPetType.slug) {
    return rejectWithValue("Invalid update pet type response.");
  }

  return mappedPetType;
});

export const deletePetType = createAsyncThunk<
  string,
  { id: string },
  { rejectValue: string; state: { auth: { tokens: { accessToken: string } | null } } }
>("pet/deletePetType", async (payload, { rejectWithValue, getState }) => {
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
    `${normalizedBaseUrl}/admin/pet-types/${payload.id}`,
    {
      method: "DELETE",
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
        errorBody?.message ?? "Failed to delete pet type."
      );
    } catch {
      return rejectWithValue("Failed to delete pet type.");
    }
  }

  return payload.id;
});

const petSlice = createSlice({
  name: "pet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPetTypes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPetTypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.petTypes = action.payload;
      })
      .addCase(fetchPetTypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Failed to fetch pet types.";
      });
    builder
      .addCase(createPetType.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createPetType.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.petTypes = [action.payload, ...state.petTypes];
      })
      .addCase(createPetType.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload ?? "Failed to create pet type.";
      });
    builder
      .addCase(updatePetType.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updatePetType.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.petTypes = state.petTypes.map((petType) =>
          petType.id === action.payload.id ? action.payload : petType
        );
      })
      .addCase(updatePetType.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload ?? "Failed to update pet type.";
      });
    builder
      .addCase(deletePetType.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deletePetType.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.petTypes = state.petTypes.filter(
          (petType) => petType.id !== action.payload
        );
      })
      .addCase(deletePetType.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload ?? "Failed to delete pet type.";
      });
  },
});

export default petSlice.reducer;
