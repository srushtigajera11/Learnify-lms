import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../../utils/axiosInstance';


const EditLesson = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lessonData, setLessonData] = useState(null); // Initially null
  const [loading, setLoading] = useState(true);
  const [newMaterial, setNewMaterial] = useState({ type: '', url: '' });

  useEffect(() => {
  const fetchLesson = async () => {
    try {
      console.log("Fetching lesson", lessonId); // 🔍
      const res = await axiosInstance.get(`/lessons/lesson/${lessonId}`);
      console.log("API response:", res.data); // 🔍
      setLessonData(res.data.lesson); // ✅ Ensure you're accessing `.lesson`
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      setLoading(false);
    }
  };
  fetchLesson();
}, [lessonId]);


  const handleChange = (e) => {
    setLessonData({ ...lessonData, [e.target.name]: e.target.value });
  };

  // ...rest of your code
  
  const handleMaterialChange = (e) => {
    setNewMaterial({ ...newMaterial, [e.target.name]: e.target.value });
  };

  const addMaterial = () => {
    if (newMaterial.type && newMaterial.url) {
      setLessonData((prev) => ({
        ...prev,
        materials: [...prev.materials, newMaterial]
      }));
      setNewMaterial({ type: '', url: '' });
    }
  };

  const removeMaterial = (index) => {
    setLessonData((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/lessons/lesson/${lessonId}`, lessonData);
      alert('Lesson updated!');
      navigate(-1); // Go back
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading lesson...</div>;
  if (!lessonData) return <div className="text-danger text-center mt-5">Lesson not found</div>;


  return (
    <div className="container mt-4">
      <h2>Edit Lesson</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Title</label>
          <input
            name="title"
            className="form-control"
            value={lessonData.title}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Description</label>
          <textarea
            name="description"
            className="form-control"
            value={lessonData.description}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Order</label>
          <input
            name="order"
            type="number"
            className="form-control"
            value={lessonData.order}
            onChange={handleChange}
          />
        </div>

        <hr />
        <h5>Existing Materials</h5>
        {lessonData.materials.length === 0 && <p>No materials added.</p>}
        <ul className="list-group mb-3">
          {lessonData.materials.map((material, index) => (
            <li key={index} className="list-group-item">
              <strong>{material.type.toUpperCase()}:</strong>
              <div className="mt-2">
                {material.type === 'video' ? (
                  <video controls width="300">
                    <source src={material.url} type="video/mp4" />
                  </video>
                ) : material.type === 'pdf' || material.type === 'doc' ? (
                  <a href={material.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                    View Document
                  </a>
                ) : material.type === 'link' ? (
                  <a href={material.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary">
                    Open Link
                  </a>
                ) : (
                  <span>Unknown type</span>
                )}
              </div>
              <button type="button" className="btn btn-danger btn-sm mt-2" onClick={() => removeMaterial(index)}>
                Delete
              </button>
            </li>
          ))}
        </ul>

        <hr />
        <h5>Add New Material</h5>
        <div className="row mb-3">
          <div className="col-md-4">
            <select
              name="type"
              className="form-select"
              value={newMaterial.type}
              onChange={handleMaterialChange}
            >
              <option value="">Select Type</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
              <option value="link">Link</option>
            </select>
          </div>
          <div className="col-md-6">
            <input
              name="url"
              className="form-control"
              placeholder="Material URL"
              value={newMaterial.url}
              onChange={handleMaterialChange}
            />
          </div>
          <div className="col-md-2">
            <button type="button" className="btn btn-success w-100" onClick={addMaterial}>
              Add
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Update Lesson</button>
      </form>
    </div>
  );
};

export default EditLesson;
