import { Link } from "react-router-dom";
import { BookOpen, PlayCircle, Award, Users } from "lucide-react";

const Register = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 min-h-screen">

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Learn Without Limits with{" "}
            <span className="text-indigo-600">Learnify</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600">
            Explore structured courses, interactive lessons, quizzes, and earn
            certificates — all in one powerful learning platform.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/register"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl shadow-lg hover:scale-105 transition"
            >
              Get Started
            </Link>

            <Link
              to="/courses"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition"
            >
              Browse Courses
            </Link>
          </div>

          <div className="flex gap-6 mt-8 text-gray-500 text-sm">
            <span>500+ Students</span>
            <span>40+ Courses</span>
            <span>Certificates</span>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src="/images/learning.png"
            alt="Learning illustration"
            className="w-full max-w-md"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Platform Features
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <BookOpen className="text-indigo-600 mb-3" />
            <h3 className="font-semibold">Structured Courses</h3>
            <p className="text-gray-500 text-sm">
              Organized lessons for better learning flow.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <PlayCircle className="text-indigo-600 mb-3" />
            <h3 className="font-semibold">Video Lessons</h3>
            <p className="text-gray-500 text-sm">
              Learn visually with engaging videos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <Award className="text-indigo-600 mb-3" />
            <h3 className="font-semibold">Certificates</h3>
            <p className="text-gray-500 text-sm">
              Earn certificate after completing courses.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <Users className="text-indigo-600 mb-3" />
            <h3 className="font-semibold">Expert Tutors</h3>
            <p className="text-gray-500 text-sm">
              Learn from experienced instructors.
            </p>
          </div>

        </div>
      </section>

      {/* COURSES PREVIEW */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Courses
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {[1,2,3].map((item)=>(
              <div
                key={item}
                className="rounded-2xl shadow hover:shadow-xl transition bg-gray-50 overflow-hidden"
              >
                <img
                  src="/images/course.jpg"
                  alt="course"
                  className="h-40 w-full object-cover"
                />

                <div className="p-5">
                  <h3 className="font-semibold text-lg">
                    React for Beginners
                  </h3>

                  <p className="text-gray-500 text-sm mt-2">
                    Learn React step by step with projects.
                  </p>

                  <button className="mt-4 text-indigo-600 font-medium">
                    View Course →
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        
        <h2 className="text-3xl font-bold text-center mb-12">
          How Learnify Works
        </h2>

        <div className="grid md:grid-cols-3 gap-6 text-center">

          <div>
            <div className="text-3xl font-bold text-indigo-600">1</div>
            <h3 className="font-semibold mt-2">Create Account</h3>
            <p className="text-gray-500 text-sm">
              Sign up as student or tutor.
            </p>
          </div>

          <div>
            <div className="text-3xl font-bold text-indigo-600">2</div>
            <h3 className="font-semibold mt-2">Start Learning</h3>
            <p className="text-gray-500 text-sm">
              Watch lessons and complete quizzes.
            </p>
          </div>

          <div>
            <div className="text-3xl font-bold text-indigo-600">3</div>
            <h3 className="font-semibold mt-2">Get Certificate</h3>
            <p className="text-gray-500 text-sm">
              Receive certificate after completion.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-16 text-center">
        
        <h2 className="text-3xl font-bold">
          Start Learning Today 🚀
        </h2>

        <Link
          to="/register"
          className="inline-block mt-6 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl shadow"
        >
          Join Learnify
        </Link>

      </section>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 py-6">
        © {new Date().getFullYear()} Learnify. All rights reserved.
      </footer>

    </div>
  );
};

export default Register;