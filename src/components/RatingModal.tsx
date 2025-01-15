import React, { useState } from "react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  onRate: (courseId: string, rating: number) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, courseId, onRate }) => {
  const [rating, setRating] = useState(0);

  const handleSubmit = () => {
    onRate(courseId, rating);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rate Course</h3>
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Submit</button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
