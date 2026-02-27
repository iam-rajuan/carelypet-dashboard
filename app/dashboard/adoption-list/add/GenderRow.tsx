interface GenderRowProps {
  value?: "male" | "female";
  name?: string;
}

export function GenderRow({ value = "male", name = "gender" }: GenderRowProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 font-medium">GENDER</label>
      <div className="flex items-center gap-6 mt-2 text-gray-800">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            className="h-4 w-4"
            defaultChecked={value === "male"}
            value="male"
          />
          Male
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            className="h-4 w-4"
            defaultChecked={value === "female"}
            value="female"
          />
          Female
        </label>
      </div>
    </div>
  );
}
