"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

type Assessment = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};

export default function TakeAssessment() {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    async function fetchAssessment() {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching assessment:", error.message);
      } else {
        setAssessment(data); // ✅ FIXED: No need for JSON.parse
      }
      setLoading(false);
    }
    fetchAssessment();
  }, [id]);

  function handleAnswerChange(questionIndex: number, selectedOption: string) {
    setAnswers((prev) => ({ ...prev, [questionIndex]: selectedOption }));
  }

  async function handleSubmit() {
    const user = await supabase.auth.getUser();
    if (!user.data?.user) {
      alert("Please log in to submit your answers.");
      return;
    }

    const score = assessment?.questions.reduce((acc, q, index) => {
      return q.answer === answers[index] ? acc + 1 : acc;
    }, 0);

    const { error } = await supabase.from("responses").insert([
      {
        user_id: user.data.user.id,
        assessment_id: id,
        answers: JSON.stringify(answers),
        score: score,
      },
    ]);

    if (error) {
      console.error("Error submitting answers:", error.message);
    } else {
      alert(
        `Test submitted! You scored ${score} out of ${assessment?.questions.length}`
      );
      router.push("/assessments");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      {assessment ? (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{assessment.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{assessment.description}</p>
            {assessment.questions.map((q, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold">{q.question}</p>
                <div className="flex flex-col space-y-2 mt-2">
                  {q.options.map((option, optIndex) => (
                    <label
                      key={optIndex}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={() => handleAnswerChange(index, option)}
                        checked={answers[index] === option}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <Button onClick={handleSubmit} className="mt-4 bg-green-500">
              Submit Test
            </Button>
          </CardContent>
        </Card>
      ) : (
        <p>Assessment not found.</p>
      )}
    </div>
  );
}
