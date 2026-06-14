export function FilterBar({
  placeholders,
  values,
  onChange,
}: {
  placeholders: string[];
  values?: string[];
  onChange?: (index: number, value: string) => void;
}) {
  return (
    <div className="filter-bar">
      {placeholders.map((placeholder, index) => (
        <input
          key={placeholder}
          placeholder={placeholder}
          value={values?.[index] ?? ""}
          onChange={(e) => onChange?.(index, e.target.value)}
        />
      ))}
      <button onClick={() => placeholders.forEach((_, i) => onChange?.(i, ""))}>Reset</button>
    </div>
  );
}
