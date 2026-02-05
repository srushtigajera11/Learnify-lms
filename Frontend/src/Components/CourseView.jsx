import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowBack,
  ExpandMore,
  Edit,
  Schedule,
  WorkspacePremium,
  AllInclusive
} from '@mui/icons-material';

const myCourses = [
  {
    id: 1,
    title: 'Communication : lessons for Better interaction',
    description: 'Master the art of effective communication for personal and professional success. This course covers verbal, non-verbal, and written communication skills for interviews, presentations, and everyday interactions.',
    category: 'Communication',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
    price: 2399.00,
    status: 'Published'
  },
  {
    id: 2,
    title: 'Intro to Python',
    description: 'A comprehensive introduction to Python for beginners. Learn the fundamentals of programming, data structures, and algorithms with hands-on projects and exercises.',
    category: 'Python',
    imageUrl: 'https://images.unsplash.com/photo-1599819095817-a068a0a104f6?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
    price: 1230.00,
    status: 'Published'
  },
  {
    id: 3,
    title: 'Advanced UI/UX Design Principles',
    description: 'Go beyond the basics and explore advanced UI/UX design principles. This course focuses on creating intuitive, user-centered designs for complex applications and systems.',
    category: 'Design',
    imageUrl: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600',
    price: 3500.00,
    status: 'Draft'
  }
];

const CourseView = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { courseId } = useParams();
  const navigate = useNavigate();

  const course = myCourses.find(c => c.id.toString() === courseId);

  if (!course) return <div className="text-gray-600">Course not found.</div>;

  return (
    <div className="p-4 md:p-6">
      <button
        onClick={() => navigate('/my-courses')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <ArrowBack className="mr-2" />
        Back to My Courses
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {course.title}
          </h1>
          <p className="text-gray-600 mb-6">
            {course.description}
          </p>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex space-x-4">
              <button
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 0
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(0)}
              >
                Curriculum
              </button>
              <button
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 1
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(1)}
              >
                Q&A
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 0 && (
            <div className="mt-2">
              <div className="border border-gray-200 rounded-lg mb-3 overflow-hidden">
                <details className="group" open>
                  <summary className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">Section 1: Introduction</span>
                    <ExpandMore className="transform group-open:rotate-180 transition-transform text-gray-500" />
                  </summary>
                  <div className="p-4 border-t border-gray-200">
                    <p className="text-gray-700">Lesson 1: Welcome to the course!</p>
                  </div>
                </details>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <details className="group">
                  <summary className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">Section 2: Core Concepts</span>
                    <ExpandMore className="transform group-open:rotate-180 transition-transform text-gray-500" />
                  </summary>
                  <div className="p-4 border-t border-gray-200">
                    <p className="text-gray-700">Lesson 1: Understanding the basics.</p>
                  </div>
                </details>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <p className="text-gray-600">Q&A section is under construction.</p>
            </div>
          )}
        </div>

        {/* Sidebar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ₹{course.price.toLocaleString()}
              </h3>
              
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center mb-6">
                <Edit className="mr-2" />
                Edit Course
              </button>

              <div className="mt-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  This course includes:
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Schedule className="text-gray-500 mr-3" />
                    <span className="text-gray-700">12 hours on-demand video</span>
                  </div>
                  
                  <div className="flex items-center">
                    <AllInclusive className="text-gray-500 mr-3" />
                    <span className="text-gray-700">Full lifetime access</span>
                  </div>
                  
                  <div className="flex items-center">
                    <WorkspacePremium className="text-gray-500 mr-3" />
                    <span className="text-gray-700">Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;