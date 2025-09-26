import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DoctorSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function DoctorSearch({ searchTerm, onSearchChange }: DoctorSearchProps) {
  return (
    <div className="my-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, specialty, or email..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
