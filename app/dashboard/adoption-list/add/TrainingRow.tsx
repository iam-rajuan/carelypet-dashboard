interface TrainingRowProps {
  value?: "yes" | "no";
  name?: string;
}

export function TrainingRow({
  value = "yes",
  name = "trained",
}: TrainingRowProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 font-medium">TRAINED</label>
      <div className="flex items-center gap-6 mt-2 text-gray-800">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            className="h-4 w-4"
            defaultChecked={value === "yes"}
            value="true"
          />
          Yes
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            className="h-4 w-4"
            defaultChecked={value === "no"}
            value="false"
          />
          No
        </label>
      </div>
    </div>
  );
}
