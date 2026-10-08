export type BookFaq = {
  id: string | null;
  question: string;
  answer: string;
  position: number;
};

const defaultAnswer =
  "The Edutech web app is designed to make learning and exam preparation easier for students by helping them set study schedules, providing reminders, offering practice questions, and giving access to study materials and expert guidance.";

export const defaultFaqs: BookFaq[] = [
  "What is the primary purpose of the Edutech web app?",
  "How do I get started with the web app?",
  "How does the study schedule feature work?",
  "Are there any resources for tracking my progress?",
].map((question, position) => ({
  id: null,
  question,
  answer: defaultAnswer,
  position,
}));

export function faqFromInput(input: { question?: unknown; answer?: unknown; position?: unknown }) {
  const question = String(input.question ?? "").trim();
  const answer = String(input.answer ?? "").trim();
  const position =
    input.position === undefined || input.position === null || input.position === ""
      ? 0
      : Number(input.position);

  if (question.length < 2 || question.length > 300) {
    return { error: "Question must be between 2 and 300 characters." };
  }
  if (answer.length < 2 || answer.length > 4000) {
    return { error: "Answer must be between 2 and 4000 characters." };
  }
  if (!Number.isInteger(position) || position < 0 || position > 999) {
    return { error: "Position must be a whole number from 0 to 999." };
  }

  return { faq: { question, answer, position } };
}

export function mapFaq(row: {
  id: string;
  question: string;
  answer: string;
  position: number;
}): BookFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    position: row.position,
  };
}
