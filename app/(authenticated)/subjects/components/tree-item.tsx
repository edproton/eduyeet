"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { System, Subject, Qualification } from "../action/get-subjects";

type TreeItemType = System | Subject | Qualification;

interface TreeItemProps {
  item: TreeItemType;
  depth: number;
}

export function TreeItem({ item, depth = 0 }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = "subjects" in item || "qualifications" in item;
  const children =
    "subjects" in item
      ? item.subjects
      : "qualifications" in item
      ? item.qualifications
      : [];

  const toggleOpen = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  const getItemType = (depth: number): string => {
    switch (depth) {
      case 0:
        return "System";
      case 1:
        return "Subject";
      case 2:
        return "Qualification";
      default:
        return "Unknown";
    }
  };

  return (
    <>
      <TableRow
        className={hasChildren ? "cursor-pointer hover:bg-muted/50" : ""}
        onClick={toggleOpen}
      >
        <TableCell
          className="font-medium"
          style={{ paddingLeft: `${depth * 1.5}rem` }}
        >
          <div className="flex items-center">
            {hasChildren &&
              (isOpen ? (
                <ChevronDownIcon className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 mr-2" />
              ))}
            {item.name}
          </div>
        </TableCell>
        <TableCell>{item.tutors}</TableCell>
        <TableCell>{item.students}</TableCell>
        <TableCell>{getItemType(depth)}</TableCell>
      </TableRow>
      {isOpen &&
        children.map((child, index) => (
          <TreeItem
            key={`${child.name}-${index}`}
            item={child}
            depth={depth + 1}
          />
        ))}
    </>
  );
}
