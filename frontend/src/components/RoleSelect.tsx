import type { Role } from "../auth/AuthContext";
import { DropdownSelect } from "./DropdownSelect";

const roleLabels: Record<Role, string> = {
  cititor: "Cititor",
  poet: "Poet"
};

type RoleSelectProps = {
  label?: string;
  value: Role;
  onChange: (role: Role) => void;
};

export function RoleSelect({ label = "Rol", value, onChange }: RoleSelectProps) {
  const options = Object.entries(roleLabels).map(([roleKey, labelText]) => ({
    value: roleKey,
    label: labelText
  }));

  return (
    <DropdownSelect
      label={label}
      value={value}
      options={options}
      onChange={(next) => onChange(next as Role)}
    />
  );
}
