import React from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Award,
  Users,
  PlayCircle,
  CheckCircle,
  Layers
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">

      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto px-8 pt-6 flex justify-between items-center">

        <img
          src="/images/logo.png"
          alt="logo"
          className="w-32 m-0 p-0 cursor-pointer hover:scale-105 transition text-blue-700"
        />

        <div className="flex gap-3">

          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-lg border border-blue-300  text-gray-700 hover:bg-white/60 transition"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-[1.03] transition"
          >
            Get Started
          </button>

        </div>

      </nav>



      {/* HERO */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-28 grid lg:grid-cols-2 gap-16 items-center">

        <div>

          <span className="inline-block bg-white/70 backdrop-blur-md px-4 py-1 rounded-full text-sm text-indigo-700 shadow-sm mb-6">
            Modern Learning Platform
          </span>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[1.1]">
            Learn smarter with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Learnify
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed">
            Structured courses, interactive lessons, quizzes and certificates —
            everything you need to build real skills in one powerful platform.
          </p>



          {/* buttons */}
          <div className="mt-10 flex flex-wrap gap-4">

            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition"
            >
              Start Learning 🚀
            </button>

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-white/80 backdrop-blur border border-gray-200 rounded-xl font-medium hover:bg-white transition"
            >
              Login
            </button>

          </div>



          {/* trust indicators */}
          <div className="flex flex-wrap gap-8 mt-12 text-gray-600 text-sm">

            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-600"/>
              500+ learners
            </div>

            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600"/>
              structured courses
            </div>

            <div className="flex items-center gap-2">
              <Award size={18} className="text-indigo-600"/>
              certificates
            </div>

          </div>

        </div>



        {/* IMAGE */}
        <div className="flex justify-center">

          <div className="relative">

            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-pink-500/20 blur-2xl rounded-3xl"></div>

            <div className="relative backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-6">

              <img
                src="/images/landing.jpg"
                alt="learning"
                className="rounded-2xl w-full max-w-md"
              />

            </div>

          </div>

        </div>

      </section>



      {/* FEATURES */}
      <section className="py-24 bg-white">

        <h2 className="text-3xl font-bold text-center mb-16">
          Why choose Learnify?
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-8">

          <Feature
            icon={<Layers />}
            title="Structured Learning"
            desc="Courses organized into clear lessons and modules."
          />

          <Feature
            icon={<PlayCircle />}
            title="Interactive Lessons"
            desc="Video and material based learning experience."
          />

          <Feature
            icon={<CheckCircle />}
            title="Track Progress"
            desc="Monitor completion and stay motivated."
          />

          <Feature
            icon={<Award />}
            title="Certificates"
            desc="Earn certificates after course completion."
          />

          <Feature
            icon={<Users />}
            title="Expert Tutors"
            desc="Learn from experienced instructors."
          />

          <Feature
            icon={<BookOpen />}
            title="Multiple Courses"
            desc="Explore multiple skills in one platform."
          />

        </div>

      </section>



      {/* HOW IT WORKS */}
      <section className="py-24">

        <h2 className="text-3xl font-bold text-center mb-16">
          How it works
        </h2>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center px-8">

          <Step
            number="1"
            title="Create account"
            desc="Sign up as student or tutor"
          />

          <Step
            number="2"
            title="Start learning"
            desc="Access lessons and quizzes"
          />

          <Step
            number="3"
            title="Get certificate"
            desc="Receive certificate on completion"
          />

        </div>

      </section>



      {/* CTA */}
      <section className="py-24 text-center bg-gradient-to-r from-indigo-600 to-blue-500 text-white">

        <h2 className="text-3xl font-bold">
          Start learning today 🚀
        </h2>

        <p className="mt-3 opacity-90">
          Join Learnify and build real skills faster
        </p>

        <button
          onClick={() => navigate("/register")}
          className="mt-8 px-10 py-3 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:scale-105 transition"
        >
          Create free account
        </button>

      </section>



      {/* FOOTER */}
      <footer className="text-center text-gray-500 py-8 text-sm">
        © {new Date().getFullYear()} Learnify. All rights reserved.
      </footer>

    </div>
  );
};



const Feature = ({ icon, title, desc }) => (
  <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 shadow hover:shadow-lg transition">

    <div className="text-indigo-600 mb-3">
      {icon}
    </div>

    <h3 className="font-semibold text-lg">
      {title}
    </h3>

    <p className="text-gray-600 text-sm mt-2">
      {desc}
    </p>

  </div>
);



const Step = ({ number, title, desc }) => (
  <div>

    <div className="text-4xl font-bold text-indigo-600">
      {number}
    </div>

    <h3 className="font-semibold mt-3">
      {title}
    </h3>

    <p className="text-gray-500 text-sm mt-2">
      {desc}
    </p>

  </div>
);


export default Home;