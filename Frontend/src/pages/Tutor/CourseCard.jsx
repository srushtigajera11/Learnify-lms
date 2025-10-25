import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
} from "@mui/material";
import { FavoriteBorder } from "@mui/icons-material";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const statusColors = {
  Published: "success",
  Draft: "warning",
  "AI Pick": "info",
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <Card
      elevation={2}
      sx={{
        cursor: "pointer",
        height: 330, // ✅ fixed height for uniform layout
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
      }}
      onClick={() => navigate(`/course/${course.id}`)}
    >
      {/* Thumbnail */}
      <Box sx={{ position: "relative", height: 150, overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="150"
          image={course.imageUrl}
          alt={course.title}
          sx={{ objectFit: "cover", width: "100%" }}
        />
        <Chip
          label={course.status}
          color={statusColors[course.status] || "default"}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "white",
            bgcolor: `${statusColors[course.status]}.dark`,
          }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, px: 2, pb: 1 }}>
        <Typography
          gutterBottom
          variant="subtitle1"
          fontWeight={600}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {course.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 36,
          }}
        >
          {course.description || "No description available."}
        </Typography>
      </CardContent>

      {/* Price & Favorite */}
      <Box
        sx={{
          px: 2,
          pb: 1.5,
          mt: "auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          ₹{course.price?.toLocaleString() || 0}
        </Typography>
        <IconButton aria-label="add to favorites" size="small">
          <FavoriteBorder />
        </IconButton>
      </Box>
    </Card>
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
