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
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 lg:p-6">
      <div className="w-full max-w-md lg:max-w-5xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-[280px] sm:w-[360px]">
              <Image
                src="/logo.png"
                alt="Institution Logo"
                width={420}
                height={140}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Zero Test Result
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your roll number to view your result
          </p>
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column - Search Section */}
          <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 lg:sticky lg:top-6">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Input Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={handleInputChange}
                  placeholder="Enter Roll Number"
                  className="w-full h-12 px-4 text-base border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}
          </div>

          {/* Right Column - Result Card */}
          <div className="lg:min-h-[400px]">
            {searched && result && gradeInfo ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-bounceIn">
                {/* Header Row */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Result Summary</h2>
                  <div className={`px-3 py-1 rounded-full border-2 font-bold text-sm ${
                    gradeInfo.grade === "A"
                      ? "border-green-500 text-green-700 bg-green-50"
                      : gradeInfo.grade === "B"
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : gradeInfo.grade === "C"
                      ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                      : gradeInfo.grade === "D"
                      ? "border-orange-500 text-orange-700 bg-orange-50"
                      : "border-red-500 text-red-700 bg-red-50"
                  }`}>
                    Grade {gradeInfo.grade}
                  </div>
                </div>

                {/* Student Information */}
                <div className="p-6 space-y-6">
                  {/* Student Details - Two Column Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Student Name</p>
                      <p className="text-sm font-bold text-gray-900">{result.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Father Name</p>
                      <p className="text-sm font-semibold text-gray-900">{result.father_name}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Roll Number</p>
                      <p className="text-sm font-bold text-gray-900">{result.roll_number}</p>
                    </div>
                  </div>

                  {/* Marks Section - Highlighted */}
                  <div className="bg-blue-50 border-2 border-blue-100 rounded-lg p-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">Obtained Marks</span>
                        <span className="text-2xl font-black text-gray-900">{result.obtained_marks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">Total Marks</span>
                        <span className="text-xl font-bold text-gray-700">{result.total_marks}</span>
                      </div>
                    </div>
                  </div>

                  {/* Grade Message */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed text-center">
                      {gradeInfo.message}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center justify-center h-full min-h-[400px] bg-white/50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium">Result will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
