"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Upload, Eye, X, ChevronDown, Plus } from "lucide-react";

import { GenderRow } from "../add/GenderRow";
import { TrainingRow } from "../add/TrainingRow";
import { VaccinationRow } from "../add/VaccinationRow";
import { NeuteredRow } from "../add/NeuteredRow";

const initialSnaps = [
  { id: 1, name: "bubby-front.jpg", size: "245KB" },
  { id: 2, name: "bubby-play.jpg", size: "198KB" },
  { id: 3, name: "bubby-park.jpg", size: "221KB" },
];

const initialTraits = [
  "Friendly",
  "Loyal",
  "Great with kids",
  "Intelligent",
  "Energetic",
];

const petProfile = {
  name: "Bubby",
  type: "Dog",
  breed: "Husky",
  year: "2",
  weight: "56",
  gender: "male" as const,
  trained: "yes" as const,
  vaccinated: "yes" as const,
  neutered: "yes" as const,
  about:
    "A playful, affectionate dog who loves outdoor adventures, gentle cuddles, and learning new tricks with a quick wag.",
  shelter: {
    name: "Carely Pets",
    phone: "555 458 5555",
  },
};

export default function EditPetForAdoption() {
  const params = useParams();
  const adoptionId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const headerId = useMemo(
    () => (adoptionId ? `Listing ID: ${adoptionId}` : "Listing ID: —"),
    [adoptionId],
  );

  const [petInfoOpen, setPetInfoOpen] = useState(true);
  const [shelterInfoOpen, setShelterInfoOpen] = useState(true);
  const [snaps, setSnaps] = useState(initialSnaps);
  const [traits, setTraits] = useState(initialTraits);
  const [traitInput, setTraitInput] = useState("");

  const removeSnap = (id: number) => {
    setSnaps(snaps.filter((snap) => snap.id !== id));
  };

  const addTrait = () => {
    const trimmed = traitInput.trim();
    if (!trimmed || traits.includes(trimmed)) return;
    setTraits([...traits, trimmed]);
    setTraitInput("");
  };

  const removeTrait = (trait: string) => {
    setTraits(traits.filter((item) => item !== trait));
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Edit pet for adoption
          </h1>
          <p className="text-gray-600">
            Update the pet listing and keep details accurate.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{headerId}</span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            Active listing
          </span>
        </div>
      </div>

      {/* ------------------- PET SNAPS ------------------- */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <p className="font-semibold text-gray-900">Pet Snaps</p>
            <p className="text-xs text-gray-500">
              Existing snaps from the listing. You can replace up to 3 files.
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#D6F2F8] rounded-xl hover:bg-[#c9edf5]">
            <Upload className="h-4 w-4 text-gray-700" />
            <span className="text-gray-800 text-sm font-medium">
              Upload snaps
            </span>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {snaps.map((snap) => (
            <div
              key={snap.id}
              className="border border-gray-200 rounded-xl px-4 py-3 flex justify-between items-center bg-gray-50"
            >
              <div>
                <p className="text-gray-800 font-medium">{snap.name}</p>
                <p className="text-xs text-gray-500">File type • {snap.size}</p>
              </div>

              <div className="flex items-center gap-4">
                <Eye className="text-gray-500 h-5 w-5 cursor-pointer" />
                <X
                  className="text-gray-500 h-5 w-5 cursor-pointer"
                  onClick={() => removeSnap(snap.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------- PET INFORMATION ------------------- */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setPetInfoOpen(!petInfoOpen)}
          className="flex w-full justify-between items-center cursor-pointer"
        >
          <p className="font-semibold text-gray-900">Pet Information</p>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              petInfoOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {petInfoOpen && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            <InputField label="NAME" defaultValue={petProfile.name} />
            <InputField label="TYPE" defaultValue={petProfile.type} dropdown />
            <InputField
              label="BREED"
              defaultValue={petProfile.breed}
              dropdown
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="YEAR" defaultValue={petProfile.year} />
              <InputField
                label="WEIGHT (lbs)"
                defaultValue={petProfile.weight}
              />
            </div>

            <GenderRow value={petProfile.gender} />
            <TrainingRow value={petProfile.trained} />
            <VaccinationRow value={petProfile.vaccinated} />
            <NeuteredRow value={petProfile.neutered} />

            {/* Personality */}
            <div>
              <label className="text-xs text-gray-500 font-medium">
                PERSONALITY (max 5)
              </label>
              <div className="flex gap-3 mt-2">
                <input
                  value={traitInput}
                  onChange={(event) => setTraitInput(event.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl"
                  placeholder="Type trait and press add"
                />
                <button
                  onClick={addTrait}
                  className="p-3 rounded-xl bg-[#D6F2F8]"
                >
                  <Plus className="h-4 w-4 text-gray-700" />
                </button>
              </div>

              <div className="flex gap-2 mt-3 flex-wrap">
                {traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1 bg-gray-200 rounded-full text-gray-700 text-sm flex items-center gap-2"
                  >
                    {trait}
                    <X
                      className="h-4 w-4 cursor-pointer text-gray-600"
                      onClick={() => removeTrait(trait)}
                    />
                  </span>
                ))}
              </div>
            </div>

            <textarea
              defaultValue={petProfile.about}
              className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl h-28 text-gray-800"
            />
          </div>
        )}
      </div>

      {/* ------------------- SHELTER INFORMATION ------------------- */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setShelterInfoOpen(!shelterInfoOpen)}
          className="flex w-full justify-between items-center cursor-pointer"
        >
          <p className="font-semibold text-gray-900">Shelter Information</p>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              shelterInfoOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {shelterInfoOpen && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            <InputField label="NAME" defaultValue={petProfile.shelter.name} />
            <InputField label="PHONE" defaultValue={petProfile.shelter.phone} />
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-4">
        <button className="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium">
          Cancel
        </button>
        <button className="px-6 py-2 rounded-xl bg-[#D6F2F8] hover:bg-[#c9edf5] text-gray-800 font-medium">
          Save changes
        </button>
      </div>
    </div>
  );
}

/* ------------------- REUSABLE COMPONENTS ------------------- */

interface InputFieldProps {
  label: string;
  placeholder?: string;
  dropdown?: boolean;
  defaultValue?: string;
}

function InputField({
  label,
  placeholder = "",
  dropdown = false,
  defaultValue = "",
}: InputFieldProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 font-medium">{label}</label>

      <div className="relative">
        <input
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-gray-800 mt-1"
        />

        {dropdown && (
          <ChevronDown className="absolute right-3 top-4 text-gray-500 h-4 w-4" />
        )}
      </div>
    </div>
  );
}
