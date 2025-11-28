import { openai } from "@/lib/openai/client";
import { Feedback } from "@/types/feedback";

interface TranscriptMessage {
  role: string;
  content: string;
}

export async function generateInterviewFeedback(
  transcript: TranscriptMessage[]
): Promise<Feedback> {
  const formattedTranscript = transcript
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Return your response as valid JSON only.",
      },
      {
        role: "user",
        content: `You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.

Transcript:
${formattedTranscript}

Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
- **Communication Skills**: Clarity, articulation, structured responses.
- **Technical Knowledge**: Understanding of key concepts for the role.
- **Problem-Solving**: Ability to analyze problems and propose solutions.
- **Cultural & Role Fit**: Alignment with company values and job role.
- **Confidence & Clarity**: Confidence in responses, engagement, and clarity.

Provide:
1. A score (0-100) for each category with detailed feedback
2. An overall total score (average of all categories)
3. 3-5 specific strengths demonstrated
4. 3-5 specific areas for improvement
5. A comprehensive final assessment (2-3 paragraphs)

Be honest and constructive. Point out both positives and negatives clearly.

Return your response as a JSON object with this exact structure:
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
  "strengths": ["strength 1", "strength 2", ...],
  "areasForImprovement": ["area 1", "area 2", ...],
  "finalAssessment": "comprehensive assessment"
}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content;

  if (!responseText) {
    throw new Error("No response from OpenAI");
  }

  const feedback: Feedback = JSON.parse(responseText);
  return feedback;
}
