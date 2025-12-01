import { openai } from "@/lib/openai/client";
import { Feedback } from "@/types/feedback";

interface TranscriptMessage {
  role: string;
  content: string;
}

export async function generateInterviewFeedback(
  transcript: TranscriptMessage[],
  originalQuestions: string[] = []
): Promise<Feedback> {
  try {
    console.log("Starting feedback generation with:", {
      transcriptLength: transcript.length,
      questionsCount: originalQuestions.length,
    });

    const formattedTranscript = transcript
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");

    // Format original questions for context
    const originalQuestionsText =
      originalQuestions.length > 0
        ? `\n\nOriginal Interview Questions:\n${originalQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
        : "";

    console.log("Calling OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on their actual responses. Return your response as valid JSON only.",
        },
        {
          role: "user",
          content: `Analyze this mock interview and provide detailed, personalized feedback based on the candidate's actual responses.

Full Transcript:
${formattedTranscript}${originalQuestionsText}

Provide:
1. An overall total score (0-100) based on all responses
2. Overall category scores with feedback:
   - Communication Skills: Clarity, articulation, structured responses
   - Technical Knowledge: Understanding of key concepts
   - Problem-Solving: Ability to analyze and propose solutions
   - Cultural & Role Fit: Alignment with role expectations
   - Confidence & Clarity: Confidence and engagement

3. Question-by-question breakdown with:
   - The exact question asked (use the original questions if provided)
   - Score for that specific answer (0-100)
   - What they did well in their answer
   - What could be improved
   - Specific actionable tips for improvement (3-5 tips)

4. 3-5 overall strengths demonstrated across the interview
5. 3-5 overall areas for improvement
6. A personalized final assessment (2-3 paragraphs) that references specific things they said

Be honest and constructive. Reference actual quotes or examples from their responses.

Return as JSON with this structure:
{
  "totalScore": number,
  "categoryScores": [
    {
      "category": "Communication Skills",
      "score": number,
      "feedback": "detailed feedback"
    },
    {
      "category": "Technical Knowledge",
      "score": number,
      "feedback": "detailed feedback"
    },
    {
      "category": "Problem-Solving",
      "score": number,
      "feedback": "detailed feedback"
    },
    {
      "category": "Cultural & Role Fit",
      "score": number,
      "feedback": "detailed feedback"
    },
    {
      "category": "Confidence & Clarity",
      "score": number,
      "feedback": "detailed feedback"
    }
  ],
  "questionBreakdown": [
    {
      "questionNumber": 1,
      "question": "exact question text",
      "score": number,
      "whatWentWell": "specific positive aspects",
      "whatToImprove": "specific areas to improve",
      "improvementTips": ["tip 1", "tip 2", "tip 3"]
    }
  ],
  "strengths": ["strength 1", "strength 2", ...],
  "areasForImprovement": ["area 1", "area 2", ...],
  "finalAssessment": "personalized assessment referencing their actual responses"
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    console.log("OpenAI API call completed");
    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    console.log("Parsing OpenAI response...");
    const feedback: Feedback = JSON.parse(responseText);
    console.log("Feedback parsed successfully");
    return feedback;
  } catch (error) {
    console.error("Error in generateInterviewFeedback:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
}
