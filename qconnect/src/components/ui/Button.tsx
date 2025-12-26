interface ButtonProps {
  label: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
}

export default function Button({ label, onClick, variant = "primary", type = "button", ariaLabel }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      : "bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300";

  return (
    <button type={type} onClick={onClick} className={styles} aria-label={ariaLabel}>
      {label}
    </button>
  );
}
