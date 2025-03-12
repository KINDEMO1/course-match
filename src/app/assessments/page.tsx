"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the expected type of an assessment
type Assessment = {
  id: string;
  title: string;
  description: string;
};

export default function Assessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchAssessments() {
      const { data, error } = await supabase.from("assessments").select("*");

      if (error) {
        console.error("Error fetching assessments:", error.message);
      } else {
        setAssessments(data as Assessment[]);
      }
    }
    fetchAssessments();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Skill Assessments</h1>
      <div className="space-y-4 w-full max-w-2xl">
        {assessments.length > 0 ? (
          assessments.map((assessment) => (
            <Card key={assessment.id}>
              <CardHeader>
                <CardTitle>{assessment.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{assessment.description}</p>
                <Button
                  onClick={() => router.push(`/assessments/${assessment.id}`)}
                  className="mt-4 bg-blue-500"
                >
                  Start Test
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>No assessments available.</p>
        )}
      </div>
    </div>
  );
}
