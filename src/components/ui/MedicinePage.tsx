"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, Pill } from "lucide-react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getAllMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from "@/lib/api/medicineApi";
import type { Medicine, MedicineRequestDto } from "@/lib/type/medicine";

const EMPTY_FORM: MedicineRequestDto = {
  name: "",
  description: "",
  dosage: "",
  category: "",
  sideEffects: "",
  manufacturer: "",
};

interface MedicinePageProps {
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  currentDoctorId?: string;
}

export default function MedicinePage({ role, currentDoctorId }: MedicinePageProps) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Medicine | null>(null);
  const [editTarget, setEditTarget] = useState<Medicine | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Medicine | null>(null);
  const [form, setForm] = useState<MedicineRequestDto>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await getAllMedicines();
      setMedicines(data);
    } catch {
      toast.error("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (medicine: Medicine) => {
    setForm({
      name: medicine.name,
      description: medicine.description,
      dosage: medicine.dosage,
      category: medicine.category,
      sideEffects: medicine.sideEffects,
      manufacturer: medicine.manufacturer,
    });
    setEditTarget(medicine);
    setShowAddModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Medicine name is required");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        const updated = await updateMedicine(editTarget.id, form);
        setMedicines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        toast.success("Medicine updated");
      } else {
        const created = await addMedicine(form);
        setMedicines((prev) => [created, ...prev]);
        toast.success("Medicine added");
      }
      setShowAddModal(false);
    } catch {
      toast.error("Failed to save medicine");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicine: Medicine) => {
    try {
      await deleteMedicine(medicine.id);
      setMedicines((prev) => prev.filter((m) => m.id !== medicine.id));
      setShowDeleteConfirm(null);
      toast.success("Medicine deleted");
    } catch {
      toast.error("Failed to delete medicine");
    }
  };

  const canEdit = (medicine: Medicine) =>
    role === "ADMIN" || (role === "DOCTOR" && medicine.addedByDoctorId === currentDoctorId);

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase()) ||
    m.manufacturer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Header */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Medicines</h1>
                  <p className="text-sm text-muted-foreground">
                    {role === "PATIENT" ? "Browse available medicines" : "Manage medicine catalog"}
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="relative md:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search medicines..."
                      className="pl-10"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {(role === "DOCTOR" || role === "ADMIN") && (
                    <button
                      onClick={handleOpenAdd}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all duration-200"
                    >
                      <Plus className="h-4 w-4" /> Add Medicine
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medicine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-0 shadow-sm h-48">
                  <div className="animate-pulse h-full bg-gray-200 rounded-lg"></div>
                </Card>
              ))
            ) : filteredMedicines.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-10">
                No medicines found.
              </p>
            ) : (
              filteredMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition border border-gray-100"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-blue-50">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{medicine.name}</p>
                        <p className="text-xs text-muted-foreground">{medicine.manufacturer}</p>
                      </div>
                    </div>
                    {medicine.category && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                        {medicine.category}
                      </Badge>
                    )}
                  </div>

                  {/* Dosage */}
                  {medicine.dosage && (
                    <p className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium text-gray-700">Dosage:</span> {medicine.dosage}
                    </p>
                  )}

                  {/* Description preview */}
                  {medicine.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {medicine.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => setSelected(medicine)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                    >
                      <Eye className="h-4 w-4" /> View
                    </button>

                    {canEdit(medicine) && (
                      <button
                        onClick={() => handleOpenEdit(medicine)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-400 hover:bg-yellow-500 text-white transition-all duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}

                    {role === "ADMIN" && (
                      <button
                        onClick={() => setShowDeleteConfirm(medicine)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" /> {selected?.name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {selected.category && (
                <div><strong>Category:</strong> <Badge className="ml-1 bg-blue-100 text-blue-700 border-blue-200">{selected.category}</Badge></div>
              )}
              {selected.dosage && (
                <div><strong>Dosage:</strong> {selected.dosage}</div>
              )}
              {selected.manufacturer && (
                <div><strong>Manufacturer:</strong> {selected.manufacturer}</div>
              )}
              {selected.description && (
                <div><strong>Description:</strong> <p className="mt-1 text-muted-foreground">{selected.description}</p></div>
              )}
              {selected.sideEffects && (
                <div><strong>Side Effects:</strong> <p className="mt-1 text-muted-foreground">{selected.sideEffects}</p></div>
              )}
            </div>
          )}
          <DialogFooter>
            <button
              onClick={() => setSelected(null)}
              className="w-full py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={() => setShowAddModal(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Name *", key: "name", type: "text" },
              { label: "Category", key: "category", type: "text" },
              { label: "Dosage", key: "dosage", type: "text" },
              { label: "Manufacturer", key: "manufacturer", type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key} className="space-y-1">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            ))}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Side Effects</label>
              <textarea
                rows={3}
                value={form.sideEffects}
                onChange={(e) => setForm({ ...form, sideEffects: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 flex gap-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50"
            >
              {saving ? "Saving..." : editTarget ? "Update" : "Add"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{showDeleteConfirm?.name}</strong>? This action cannot be undone.
          </p>
          <DialogFooter className="flex gap-2 mt-4">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}