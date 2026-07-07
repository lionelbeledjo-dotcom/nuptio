import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useWedding } from "@/hooks/useWedding";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Trash2, Users, Circle, RectangleHorizontal, GripVertical } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";

export const Route = createFileRoute("/_authenticated/dashboard/seating")({
  component: SeatingPage,
});

/* ─────────────── Draggable Guest Chip ─────────────── */
function DraggableGuest({ id, name, compact }: { id: string; name: string; compact?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: "guest", guestId: id, name },
  });

  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-md ${
        compact ? "text-xs px-2 py-1" : ""
      }`}
    >
      <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="truncate max-w-[140px]">{name}</span>
    </div>
  );
}

/* ─────────────── Droppable Table ─────────────── */
function DroppableTable({
  table,
  seated,
  guests,
  shape,
  onRemoveGuest,
  onRemoveTable,
}: {
  table: any;
  seated: any[];
  guests: any[];
  shape: "round" | "rectangle";
  onRemoveGuest: (guestId: string) => void;
  onRemoveTable: (tableId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `table-${table.id}`,
    data: { type: "table", tableId: table.id },
  });

  const isFull = seated.length >= table.capacity;
  const borderColor = isFull ? "border-emerald-500" : "border-[#D4A574]";
  const isRound = shape === "round";

  return (
    <div
      ref={setNodeRef}
      className={`relative border-2 ${borderColor} ${
        isOver ? "ring-2 ring-[#D4A574]/50 bg-[#D4A574]/5" : "bg-card"
      } transition-all duration-200 ${
        isRound
          ? "rounded-full w-44 h-44 md:w-52 md:h-52 flex flex-col items-center justify-center p-4"
          : "rounded-xl w-full max-w-xs min-h-[160px] p-4"
      }`}
    >
      {/* Header */}
      <div className={`${isRound ? "text-center" : "flex items-center justify-between mb-3"}`}>
        <div>
          <h4 className="font-display text-sm md:text-base font-semibold truncate max-w-[120px]">
            {table.table_name}
          </h4>
          <p className={`text-[10px] md:text-xs ${isFull ? "text-emerald-600" : "text-[#D4A574]"}`}>
            {seated.length}/{table.capacity} places
          </p>
        </div>
        {!isRound && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onRemoveTable(table.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Seated guests chips */}
      <div
        className={`${
          isRound
            ? "flex flex-wrap justify-center gap-1 mt-1 max-h-[70px] overflow-hidden"
            : "flex flex-wrap gap-1.5 mt-1"
        }`}
      >
        {seated.map((a: any) => {
          const g = guests.find((x: any) => x.id === a.guest_id);
          return (
            <div
              key={a.id}
              className="group relative flex items-center gap-1 bg-[#D4A574]/10 border border-[#D4A574]/30 rounded-full px-2 py-0.5 text-[11px] md:text-xs"
            >
              <DraggableGuest id={a.guest_id} name={g?.full_name ?? "Invité"} compact />
              <button
                onClick={() => onRemoveGuest(a.guest_id)}
                className="hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-destructive/80 text-white text-[9px] absolute -top-1 -right-1"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>

      {/* Remove button for round tables */}
      {isRound && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-card border border-border text-muted-foreground hover:text-destructive"
          onClick={() => onRemoveTable(table.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}

      {/* Drop indicator */}
      {isOver && !isFull && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-[#D4A574] text-xs font-medium bg-card/90 px-2 py-1 rounded">
            Déposer ici
          </div>
        </div>
      )}
      {isOver && isFull && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-destructive text-xs font-medium bg-card/90 px-2 py-1 rounded">
            Table complète
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── Unassigned Panel (Droppable) ─────────────── */
function UnassignedPanel({ guests }: { guests: any[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "unassigned-zone",
    data: { type: "unassigned" },
  });

  return (
    <Card
      ref={setNodeRef}
      className={`p-5 border-border/60 h-fit lg:sticky lg:top-6 transition-all ${
        isOver ? "ring-2 ring-[#D4A574]/50 bg-[#D4A574]/5" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-4 w-4 text-[#D4A574]" />
        <h3 className="font-display text-lg">Non placés</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {guests.length}
        </span>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
        {guests.map((g: any) => (
          <DraggableGuest key={g.id} id={g.id} name={g.full_name} />
        ))}
        {guests.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Tous les invités sont placés !
          </p>
        )}
      </div>
    </Card>
  );
}

/* ─────────────── Main Page ─────────────── */
function SeatingPage() {
  const { data: wedding } = useWedding();
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newCap, setNewCap] = useState(8);
  const [tableShape, setTableShape] = useState<"round" | "rectangle">("round");
  const [activeGuest, setActiveGuest] = useState<{ id: string; name: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const { data: tables = [] } = useQuery({
    queryKey: ["tables", wedding?.id],
    enabled: !!wedding,
    queryFn: async () => {
      const { data } = await supabase
        .from("tables_seating")
        .select("*")
        .eq("wedding_id", wedding!.id)
        .order("table_number");
      return data ?? [];
    },
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests-simple", wedding?.id],
    enabled: !!wedding,
    queryFn: async () => {
      const { data } = await supabase
        .from("guests")
        .select("id, full_name")
        .eq("wedding_id", wedding!.id);
      return data ?? [];
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments", wedding?.id],
    enabled: !!wedding,
    queryFn: async () => {
      if (tables.length === 0) return [];
      const { data } = await supabase
        .from("table_assignments")
        .select("*")
        .in("table_id", tables.map((t: any) => t.id));
      return data ?? [];
    },
  });

  const assignedIds = useMemo(() => new Set(assignments.map((a: any) => a.guest_id)), [assignments]);
  const unassigned = useMemo(() => guests.filter((g: any) => !assignedIds.has(g.id)), [guests, assignedIds]);

  /* ── Supabase actions ── */
  async function addTable() {
    if (!wedding || !newName.trim()) return;
    const { error } = await supabase.from("tables_seating").insert({
      wedding_id: wedding.id,
      table_name: newName.trim(),
      capacity: newCap,
      table_number: tables.length + 1,
    });
    if (error) return toast.error(error.message);
    setNewName("");
    toast.success("Table créée");
    qc.invalidateQueries({ queryKey: ["tables", wedding.id] });
  }

  async function assignGuest(tableId: string, guestId: string) {
    // Remove existing assignment first
    await supabase.from("table_assignments").delete().eq("guest_id", guestId);
    const { error } = await supabase.from("table_assignments").insert({
      table_id: tableId,
      guest_id: guestId,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["assignments", wedding?.id] });
  }

  async function unassignGuest(guestId: string) {
    await supabase.from("table_assignments").delete().eq("guest_id", guestId);
    qc.invalidateQueries({ queryKey: ["assignments", wedding?.id] });
  }

  async function removeTable(id: string) {
    await supabase.from("table_assignments").delete().eq("table_id", id);
    await supabase.from("tables_seating").delete().eq("id", id);
    toast.success("Table supprimée");
    qc.invalidateQueries({ queryKey: ["tables", wedding?.id] });
    qc.invalidateQueries({ queryKey: ["assignments", wedding?.id] });
  }

  /* ── DnD handlers ── */
  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const guestId = active.data.current?.guestId ?? (active.id as string);
    const guest = guests.find((g: any) => g.id === guestId);
    if (guest) {
      setActiveGuest({ id: guest.id, name: guest.full_name });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveGuest(null);
    const { active, over } = event;
    if (!over) return;

    const guestId = active.data.current?.guestId ?? (active.id as string);
    const overData = over.data.current;

    if (overData?.type === "table") {
      const tableId = overData.tableId;
      const table = tables.find((t: any) => t.id === tableId);
      const seated = assignments.filter((a: any) => a.table_id === tableId);
      if (table && seated.length >= table.capacity) {
        toast.error("Cette table est complète");
        return;
      }
      assignGuest(tableId, guestId);
    } else if (overData?.type === "unassigned" || over.id === "unassigned-zone") {
      unassignGuest(guestId);
    }
  }

  if (!wedding) {
    return (
      <div className="p-8 text-muted-foreground">Créez d'abord votre mariage.</div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-foreground">Plan de table</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Glissez-déposez vos invités sur les tables
            </p>
          </div>

          {/* Shape toggle */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
            <Button
              variant={tableShape === "round" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTableShape("round")}
              className={tableShape === "round" ? "bg-[#D4A574] text-white hover:bg-[#D4A574]/90" : ""}
            >
              <Circle className="h-4 w-4 mr-1" />
              Rondes
            </Button>
            <Button
              variant={tableShape === "rectangle" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTableShape("rectangle")}
              className={tableShape === "rectangle" ? "bg-[#D4A574] text-white hover:bg-[#D4A574]/90" : ""}
            >
              <RectangleHorizontal className="h-4 w-4 mr-1" />
              Rectangles
            </Button>
          </div>
        </div>

        {/* Create table form */}
        <Card className="p-4 border-border/60 mb-8">
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="text-xs text-muted-foreground font-medium">Nom de la table</label>
              <Input
                placeholder="Ex : Table des Roses"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTable()}
                className="mt-1"
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-muted-foreground font-medium">Places</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={newCap}
                onChange={(e) => setNewCap(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <Button
              onClick={addTable}
              className="bg-[#D4A574] text-white hover:bg-[#D4A574]/90 shrink-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Créer une table
            </Button>
          </div>
        </Card>

        {/* Main layout: Tables (left) + Unassigned (right) */}
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Tables area */}
          <div>
            {tables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Aucune table. Créez-en une pour commencer.
                </p>
              </div>
            ) : (
              <div
                className={`flex flex-wrap gap-6 ${
                  tableShape === "round" ? "justify-center md:justify-start" : ""
                }`}
              >
                {tables.map((t: any) => {
                  const seated = assignments.filter((a: any) => a.table_id === t.id);
                  return (
                    <DroppableTable
                      key={t.id}
                      table={t}
                      seated={seated}
                      guests={guests}
                      shape={tableShape}
                      onRemoveGuest={unassignGuest}
                      onRemoveTable={removeTable}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Unassigned guests panel */}
          <UnassignedPanel guests={unassigned} />
        </div>
      </div>

      {/* Drag overlay - ghost shown while dragging */}
      <DragOverlay>
        {activeGuest ? (
          <div className="flex items-center gap-2 rounded-full border-2 border-[#D4A574] bg-card px-3 py-1.5 text-sm shadow-lg cursor-grabbing">
            <GripVertical className="h-3 w-3 text-[#D4A574]" />
            <span>{activeGuest.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
