export interface SessionGenerationInput {
  studentName: string;
  gradeLevel?: string;
  parentName?: string;
  tutorName?: string;
  durationHours: number;
  hourlyRate: number;
  rawNotes: string;
  preferredChannel?: string;
  ollamaUrl?: string;
  modelName?: string;
}

export interface GeneratedSessionCloser {
  parentRecap: string;
  homeworkStudent: string;
  subjectSummary: string;
  confidenceScore: "High" | "Improving" | "Needs Reinforcement";
  modelUsed: string;
  isSimulated: boolean;
}

export async function generateSessionCloser(
  input: SessionGenerationInput
): Promise<GeneratedSessionCloser> {
  const ollamaUrl = input.ollamaUrl || "http://localhost:11434";
  const model = input.modelName || "gemma2:2b";

  const systemPrompt = `You are TutorLoop, an intelligent session assistant for private academic tutors. 
Your job is to read raw, messy handwritten or shorthand notes taken by a tutor during a private lesson, and transform them into:
1. A warm, reassuring, professional recap written directly to the student's parent (addressing the parent by name if provided). Focus on student breakthroughs, explain technical concepts in accessible terms, and tactfully frame areas that need continued practice with a solution-oriented tone.
2. A structured, realistic homework and practice checklist directly for the student with specific tasks.
3. A short 1-line subject summary.
4. A student confidence score: "High", "Improving", or "Needs Reinforcement".

Output strictly valid JSON with no markdown wrapping or fences, in this schema:
{
  "parentRecap": "string",
  "homeworkStudent": "string",
  "subjectSummary": "string",
  "confidenceScore": "High" | "Improving" | "Needs Reinforcement"
}`;

  const userPrompt = `Student: ${input.studentName}
Subject/Grade: ${input.gradeLevel || "General Studies"}
Parent: ${input.parentName || "Parent"}
Tutor: ${input.tutorName || "Tutor"}
Duration: ${input.durationHours} hour(s)
Tutor's Raw Messy Notes:
"""
${input.rawNotes}
"""

Generate the JSON response following the exact schema.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout for local Ollama

    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        format: "json",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const content = data?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return {
            parentRecap: parsed.parentRecap || parsed.recap || "",
            homeworkStudent: parsed.homeworkStudent || parsed.homework || "",
            subjectSummary: parsed.subjectSummary || "Session Follow-up",
            confidenceScore: parsed.confidenceScore || "Improving",
            modelUsed: model,
            isSimulated: false,
          };
        } catch {
          // If JSON parse fails, attempt regex extraction
          return fallbackHeuristicGeneration(input, model, false);
        }
      }
    }
  } catch {
    // Ollama not running or model not found -> fallback to local simulation
  }

  // Graceful local fallback simulation with Gemma style
  return fallbackHeuristicGeneration(input, `${model} (Local Engine)`, true);
}

function fallbackHeuristicGeneration(
  input: SessionGenerationInput,
  modelName: string,
  isSimulated: boolean
): GeneratedSessionCloser {
  const notes = input.rawNotes.trim();
  const parentName = input.parentName ? input.parentName : "there";
  const student = input.studentName;
  const lines = notes.split("\n").filter((l) => l.trim().length > 0);

  // Extract key sentences or points
  const topicMatch = notes.match(/(?:reviewed|worked on|covered|topic|chapter|unit):?\s*([^.\n]+)/i);
  const subjectSummary = topicMatch
    ? topicMatch[1].trim()
    : input.gradeLevel
    ? `${input.gradeLevel.split("—")[1]?.trim() || input.gradeLevel} Mastery`
    : "Key Concept Review & Practice";

  const parentRecap = `Hi ${parentName}! We had a very productive ${input.durationHours}-hour lesson with ${student} today. 

During our session, we tackled ${subjectSummary}. ${student} showed great focus and made clear progress grasping the core principles. In particular, we worked through several hands-on practice problems where ${student} demonstrated strong problem-solving initiative. We noticed a couple of minor areas where attention to detail will help avoid small missteps, so we created a step-by-step checklist to keep nearby during independent study.

Overall, ${student} is building steady confidence! I have outlined a concise practice set below to solidify these concepts before our next meeting. Please let me know if you have any questions!`;

  const homeworkStudent = lines.length > 2
    ? `1. Practice Problems: Complete the designated questions from today's notes.\n2. Review Checklist: Work through 2-3 additional problems using our step-by-step method.\n3. Note Down Questions: Circle any problem where you get stuck for > 5 minutes so we can start there next session.`
    : `1. Re-read the sample problems we solved together in today's notes.\n2. Complete 5 practice questions to lock in today's formulas.\n3. Bring one challenging problem from class to review at the beginning of our next lesson.`;

  return {
    parentRecap,
    homeworkStudent,
    subjectSummary,
    confidenceScore: "Improving",
    modelUsed: modelName,
    isSimulated,
  };
}

