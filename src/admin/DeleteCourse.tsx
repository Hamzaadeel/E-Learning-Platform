import React from "react";
import { Trash } from "lucide-react";

interface DeleteCourseProps {
  onClick: () => void; // Function to open the delete modal
}

export const DeleteCourse: React.FC<DeleteCourseProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="pl-2 text-red-600">
      <Trash className="h-5 w-5" />
    </button>
  );
};
