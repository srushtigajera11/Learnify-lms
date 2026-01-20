import React from "react";
import { Heart } from "lucide-react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Published: "bg-green-100 text-green-800 border-green-200",
  Draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "AI Pick": "bg-blue-100 text-blue-800 border-blue-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    return statusColors[status] || statusColors.default;
  };

  return (
    <div
      className="group bg-white rounded-lg shadow-sm border border-gray-200 
                 hover:shadow-md hover:-translate-y-1 transition-all duration-200 
                 cursor-pointer h-[330px] flex flex-col overflow-hidden"
      onClick={() => navigate(`/tutor/course/${course.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative h-[150px] overflow-hidden">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            course.status
          )}`}
        >
          {course.status}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        <h3
          className="font-semibold text-gray-900 mb-2 
                     truncate text-sm md:text-base"
          title={course.title}
        >
          {course.title}
        </h3>

        <p
          className="text-gray-600 text-sm flex-1 
                     line-clamp-2 min-h-[2.5rem]"
          title={course.description}
        >
          {course.description || "No description available."}
        </p>

        {/* Price & Favorite */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <span className="font-bold text-lg text-gray-900">
            ₹{course.price?.toLocaleString() || 0}
          </span>
          <button
            className="p-2 text-gray-400 hover:text-red-500 
                       hover:bg-red-50 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Add favorite logic here
            }}
            aria-label="Add to favorites"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

CourseCard.propTypes = {
  course: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    description: PropTypes.string,
  }).isRequired,
};

export default CourseCard;