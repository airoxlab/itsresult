"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";
import confetti from "canvas-confetti";

// TypeScript interfaces
interface StudentResult {
  id: number;
  name: string;
  father_name: string;
  roll_number: string;
  total_marks: number;
  obtained_marks: number;
}

type Grade = "A" | "B" | "C" | "D" | "F";

interface GradeInfo {
  grade: Grade;
  message: string;
  showConfetti: boolean;
}

export default function ZeroTestResult() {
  // State management
  const [rollNumber, setRollNumber] = useState("");
  const [result, setResult] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Grade calculation function (strict requirements)
  const calculateGrade = (obtained: number, total: number): GradeInfo => {
    const percentage = (obtained / total) * 100;

    if (percentage >= 80) {
      return {
        grade: "A",
        message: "Excellent performance! Keep shining 🌟",
        showConfetti: true,
      };
    } else if (percentage >= 70) {
      return {
        grade: "B",
        message: "Excellent performance! Keep shining 🌟",
        showConfetti: true,
      };
    } else if (percentage >= 60) {
      return {
        grade: "C",
        message: "You are improving. Stay consistent and push harder 💪",
        showConfetti: false,
      };
    } else if (percentage >= 20) {
      return {
        grade: "D",
        message: "You are improving. Stay consistent and push harder 💪",
        showConfetti: false,
      };
    } else {
      return {
        grade: "F",
        message: "Do not lose hope. This is just a phase — stronger days are coming ❤️",
        showConfetti: false,
      };
    }
  };

  // Confetti animation function
  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    if (!rollNumber.trim()) {
      setError("Please enter a roll number");
      return;
    }

    // Reset states
    setLoading(true);
    setError("");
    setResult(null);
    setSearched(false);

    try {
      // Fetch from Supabase
      const { data, error: fetchError } = await supabase
        .from("students")
        .select("id, name, father_name, roll_number, total_marks, obtained_marks")
        .eq("roll_number", rollNumber.trim())
        .single();

      if (fetchError || !data) {
        setError("No result found for this roll number");
        setSearched(true);
        setLoading(false);
        return;
      }

      // Set result
      setResult(data);
      setSearched(true);

      // Calculate grade and trigger confetti if needed
      const gradeInfo = calculateGrade(data.obtained_marks, data.total_marks);
      if (gradeInfo.showConfetti) {
        setTimeout(() => triggerConfetti(), 300);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRollNumber(e.target.value);
    setError("");
    setResult(null);
    setSearched(false);
  };

  // Get grade info for display
  const gradeInfo = result
    ? calculateGrade(result.obtained_marks, result.total_marks)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-8">
            <div className="relative w-[280px] sm:w-[360px]">
              <Image
                src="/logo.png"
                alt="Institution Logo"
                width={420}
                height={140}
                className="w-full h-auto drop-shadow-sm"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Zero Test Result
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium">
            Enter your roll number to view your result
          </p>
        </div>

        {/* Search Section - Glass Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sm:p-8 mb-6">
          <form onSubmit={handleSearch} className="space-y-5">
            {/* Input Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Roll Number"
                  className="w-full h-14 pl-12 pr-4 text-base border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400 bg-white"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 rounded-xl transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                "Search Result"
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-5 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl">
              <p className="text-red-600 text-sm font-medium text-center flex items-center justify-center gap-2">
                <span>❌</span>
                <span>{error}</span>
              </p>
            </div>
          )}
        </div>

        {/* Result Card */}
        {searched && result && gradeInfo && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-bounceIn">
            {/* Grade Header */}
            <div className={`p-6 sm:p-8 text-center ${
              gradeInfo.grade === "A" || gradeInfo.grade === "B"
                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                : gradeInfo.grade === "C" || gradeInfo.grade === "D"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                : "bg-gradient-to-r from-red-500 to-rose-600"
            }`}>
              <div className="text-6xl sm:text-7xl font-black text-white mb-3">
                {gradeInfo.grade}
              </div>
              <p className="text-white text-base sm:text-lg font-semibold">
                Grade {gradeInfo.grade}
              </p>
            </div>

            {/* Student Information */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Student Details Grid */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Student Name</span>
                  <span className="text-gray-900 font-bold text-lg">{result.name}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Father Name</span>
                  <span className="text-gray-900 font-semibold">{result.father_name}</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Roll Number</span>
                  <span className="text-blue-600 font-bold">{result.roll_number}</span>
                </div>
              </div>

              {/* Marks Section */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Obtained Marks</span>
                  <span className="text-2xl font-bold text-gray-900">{result.obtained_marks}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Total Marks</span>
                  <span className="text-2xl font-bold text-gray-900">{result.total_marks}</span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">Grade</span>
                    <span className={`text-3xl font-black ${
                      gradeInfo.grade === "A" || gradeInfo.grade === "B"
                        ? "text-green-600"
                        : gradeInfo.grade === "C" || gradeInfo.grade === "D"
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}>
                      {gradeInfo.grade}
                    </span>
                  </div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className={`p-5 rounded-xl border-2 ${
                gradeInfo.grade === "A" || gradeInfo.grade === "B"
                  ? "bg-green-50 border-green-200"
                  : gradeInfo.grade === "C" || gradeInfo.grade === "D"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              }`}>
                <p className={`text-center font-semibold text-sm sm:text-base ${
                  gradeInfo.grade === "A" || gradeInfo.grade === "B"
                    ? "text-green-800"
                    : gradeInfo.grade === "C" || gradeInfo.grade === "D"
                    ? "text-yellow-900"
                    : "text-red-800"
                }`}>
                  {gradeInfo.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
