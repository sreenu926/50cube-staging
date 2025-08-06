/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertCircle,
  Target,
  Zap,
} from "lucide-react";
import { leaguesApi } from "../../services/api";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface League {
  id: string;
  name: string;
  description: string;
  timeLimit: number; // in minutes
  questions: Question[];
}

const LeagueChallenge: React.FC = () => {
  const { id: leagueId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
    completionTime: number;
  } | null>(null);

  // Fetch league details and questions
  useEffect(() => {
    if (leagueId) {
      fetchLeagueData(leagueId);
    }
  }, [leagueId]);

  const fetchLeagueData = async (id: string) => {
    try {
      setLoading(true);
      const response = await leaguesApi.getLeague(id);

      if (response.success && response.data) {
        const leagueData = response.data as any;

        // Create sample questions if not provided by API
        const sampleQuestions: Question[] = [
          {
            id: "q1",
            question:
              "What is the primary purpose of speed reading techniques?",
            options: [
              "To read faster without comprehension",
              "To improve both reading speed and comprehension",
              "To memorize everything you read",
              "To skip difficult sections",
            ],
            correctAnswer: 1,
            explanation:
              "Speed reading aims to increase reading speed while maintaining or improving comprehension.",
          },
          {
            id: "q2",
            question:
              "Which technique helps reduce subvocalization while reading?",
            options: [
              "Reading out loud",
              "Using a finger to point at words",
              "Humming or counting while reading",
              "Reading very slowly",
            ],
            correctAnswer: 2,
            explanation:
              "Humming or counting occupies the vocal cords and helps prevent subvocalization.",
          },
          {
            id: "q3",
            question: "What is the average reading speed for adults?",
            options: [
              "100-150 WPM",
              "200-250 WPM",
              "350-400 WPM",
              "500-600 WPM",
            ],
            correctAnswer: 1,
            explanation:
              "Most adults read between 200-250 words per minute with good comprehension.",
          },
          {
            id: "q4",
            question:
              "Which eye movement pattern is most efficient for reading?",
            options: [
              "Reading word by word",
              "Smooth left-to-right movement",
              "Fixation-saccade pattern",
              "Circular movements",
            ],
            correctAnswer: 2,
            explanation:
              "The fixation-saccade pattern allows eyes to fixate on word groups and jump efficiently.",
          },
          {
            id: "q5",
            question: "What is 'chunking' in reading comprehension?",
            options: [
              "Breaking text into physical pieces",
              "Grouping words or ideas together for better understanding",
              "Reading only certain paragraphs",
              "Skipping words randomly",
            ],
            correctAnswer: 1,
            explanation:
              "Chunking involves grouping related information together to improve comprehension and retention.",
          },
        ];

        const leagueWithQuestions: League = {
          id: leagueData.id,
          name: leagueData.name || "League Challenge",
          description:
            leagueData.description || "Test your knowledge and skills",
          timeLimit: leagueData.timeLimit || 10, // 10 minutes default
          questions: leagueData.questions || sampleQuestions,
        };

        setLeague(leagueWithQuestions);
        setTimeRemaining(leagueWithQuestions.timeLimit * 60); // Convert to seconds
        setAnswers(new Array(leagueWithQuestions.questions.length).fill(-1));
      } else {
        setError("Failed to load league challenge");
      }
    } catch (err: any) {
      console.error("Error fetching league:", err);
      setError(err.message || "Failed to load challenge");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = useCallback(
    async (finalAnswers?: number[]) => {
      if (!league || !leagueId || !startTime) return;

      try {
        setSubmitting(true);
        setQuizCompleted(true);

        const answersToSubmit = finalAnswers || answers;
        const endTime = Date.now();
        const completionTime = Math.round((endTime - startTime) / 1000); // in seconds

        // Calculate results
        let correctCount = 0;
        league.questions.forEach((question, index) => {
          if (answersToSubmit[index] === question.correctAnswer) {
            correctCount++;
          }
        });

        const accuracy = correctCount / league.questions.length;
        const accuracyPercentage = Math.round(accuracy * 100);

        const quizResults = {
          correctAnswers: correctCount,
          totalQuestions: league.questions.length,
          accuracy: accuracyPercentage,
          completionTime,
        };

        setResults(quizResults);

        // Submit to backend
        const response = await leaguesApi.submitLeague(leagueId, {
          answers: answersToSubmit,
          completionTime,
          accuracy: accuracyPercentage,
        });

        if (response.success) {
          console.log("Quiz submitted successfully");
        } else {
          console.error("Submission failed:", response.error);
        }
      } catch (err) {
        console.error("Error submitting quiz:", err);
        alert("Failed to submit quiz. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [league, leagueId, startTime, answers]
  );

  const handleTimeUp = useCallback(() => {
    if (!quizCompleted) {
      alert("Time's up! Submitting your current answers.");
      submitQuiz();
    }
  }, [quizCompleted, submitQuiz]);

  // Timer countdown
  useEffect(() => {
    if (quizStarted && timeRemaining > 0 && !quizCompleted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 10000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining, quizCompleted, handleTimeUp]);

  const startQuiz = () => {
    setQuizStarted(true);
    setStartTime(Date.now());
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = selectedAnswer;
      setAnswers(newAnswers);
      setSelectedAnswer(null);

      if (currentQuestionIndex < (league?.questions.length || 0) - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        // Quiz completed
        submitQuiz(newAnswers);
      }
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedAnswer(
        answers[currentQuestionIndex - 1] !== -1
          ? answers[currentQuestionIndex - 1]
          : null
      );
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const goToLeaderboard = () => {
    navigate(`/leagues/${leagueId}/leaderboard`);
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/leagues")}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
          >
            Back to Leagues
          </button>
        </div>
      </div>
    );
  }

  if (!league) return null;

  // Results screen
  if (quizCompleted && results) {
    return (
      <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div
              className={`px-8 py-12 text-white text-center ${
                results.accuracy >= 80
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : results.accuracy >= 60
                  ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                  : "bg-gradient-to-r from-red-500 to-pink-600"
              }`}
            >
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                {results.accuracy >= 80 ? (
                  <Trophy className="w-12 h-12" />
                ) : results.accuracy >= 60 ? (
                  <Target className="w-12 h-12" />
                ) : (
                  <Zap className="w-12 h-12" />
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">Challenge Complete!</h1>
              <p className="text-xl opacity-90">{league.name}</p>
            </div>

            {/* Results */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {results.accuracy}%
                  </div>
                  <div className="text-blue-700 font-medium">Accuracy</div>
                  <div className="text-sm text-blue-600 mt-1">
                    {results.correctAnswers}/{results.totalQuestions} correct
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {formatTime(results.completionTime)}
                  </div>
                  <div className="text-purple-700 font-medium">Time Taken</div>
                  <div className="text-sm text-purple-600 mt-1">
                    of {league.timeLimit} minutes
                  </div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.max(
                      1,
                      Math.floor(
                        results.accuracy * (100 - results.completionTime / 10)
                      )
                    )}
                  </div>
                  <div className="text-green-700 font-medium">Score</div>
                  <div className="text-sm text-green-600 mt-1">
                    Based on accuracy & speed
                  </div>
                </div>
              </div>

              {/* Performance Message */}
              <div className="text-center mb-8">
                {results.accuracy >= 80 ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-2xl">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      Excellent Performance! 🏆
                    </h3>
                    <p className="text-green-700">
                      You've demonstrated outstanding knowledge and skills.
                    </p>
                  </div>
                ) : results.accuracy >= 60 ? (
                  <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl">
                    <Target className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">
                      Good Job! 🎯
                    </h3>
                    <p className="text-yellow-700">
                      Solid performance with room for improvement.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-red-800 mb-2">
                      Keep Practicing! 💪
                    </h3>
                    <p className="text-red-700">
                      There's always room to grow and improve your skills.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={goToLeaderboard}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  View Leaderboard
                </button>

                <button
                  onClick={() => navigate("/leagues")}
                  className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Back to Leagues
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-quiz screen
  if (!quizStarted) {
    return (
      <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4">{league.name}</h1>
              <p className="text-xl text-blue-100">{league.description}</p>
            </div>

            {/* Instructions */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Challenge Instructions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-blue-50 rounded-2xl">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-800">
                    {league.timeLimit} Minutes
                  </div>
                  <div className="text-sm text-gray-600">Time Limit</div>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-2xl">
                  <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-800">
                    {league.questions.length} Questions
                  </div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-2xl">
                  <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="font-bold text-gray-800">
                    Accuracy + Speed
                  </div>
                  <div className="text-sm text-gray-600">Scoring Method</div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-yellow-800 mb-3">
                  📋 Important Rules:
                </h3>
                <ul className="space-y-2 text-yellow-700">
                  <li>• Answer all questions to the best of your ability</li>
                  <li>• You can navigate back to previous questions</li>
                  <li>• Submit before time runs out</li>
                  <li>
                    • Ranking is based on accuracy first, then completion time
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={startQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Start Challenge
                  <ArrowRight className="w-5 h-5 inline-block ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz screen
  const currentQuestion = league.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / league.questions.length) * 100;

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Timer Bar */}
      <div className="fixed top-20 left-0 right-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {league.questions.length}
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div
              className={`flex items-center gap-2 font-bold ${
                timeRemaining < 60 ? "text-red-600" : "text-gray-700"
              }`}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-20 max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8">
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                      selectedAnswer === index
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAnswer === index && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Previous
              </button>

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">
                  Progress: {currentQuestionIndex + 1}/{league.questions.length}
                </div>
                <div className="text-xs text-gray-500">
                  {Math.round(progress)}% complete
                </div>
              </div>

              <button
                onClick={nextQuestion}
                disabled={selectedAnswer === null || submitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
              >
                {currentQuestionIndex === league.questions.length - 1
                  ? "Submit"
                  : "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueChallenge;
