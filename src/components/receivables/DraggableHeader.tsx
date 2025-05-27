import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

function DraggableHeader({ columns, setColumns }: any) {
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = columns.findIndex((c: any) => c.id === active.id);
      const newIndex = columns.findIndex((c: any) => c.id === over.id);
      setColumns(arrayMove(columns, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={columns.map((col: any) => col.id)}
        strategy={verticalListSortingStrategy}
      >
        <tr>
          {columns.map((col: any) => (
            <SortableHeader key={col.id} id={col.id} label={col.label} />
          ))}
        </tr>
      </SortableContext>
    </DndContext>
  );
}

function SortableHeader({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <th
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="px-4 py-3 text-left bg-gray-100 text-gray-800 uppercase text-xs font-semibold cursor-move"
    >
      {label}
    </th>
  );
}

export default DraggableHeader;
