import { useState, useCallback, useMemo } from 'react';
import questionsData from '@/data/questionnaire.json';

export interface Question {
  dimension: string;
  indicator: string;
  question: string;
  options: string[];
  role: string;
}

export interface Answer {
  dimension: string;
  indicator: string;
  question: string;
  selectedOption: number;
  selectedText: string;
}

export interface UserInfo {
  company: 'Prodeval' | 'Aventech' | null;
  firstName: string;
  lastName: string;
}

export interface QuestionnaireState {
  selectedRole: string | null;
  answers: Answer[];
  currentDimensionIndex: number;
  userInfo: UserInfo;
}

export function useQuestionnaire() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    company: null,
    firstName: '',
    lastName: '',
  });

  // Get unique roles from questions
  const roles = useMemo(() => {
    const uniqueRoles = new Set<string>();
    questionsData.forEach((q: Question) => {
      uniqueRoles.add(q.role);
    });
    return Array.from(uniqueRoles).sort();
  }, []);

  // Filter questions based on selected role
  const filteredQuestions = useMemo(() => {
    if (!selectedRole) return [];
    return questionsData.filter(
      (q: Question) =>
        q.role === selectedRole ||
        q.role === 'Tous les acteurs impliqués dans la collaboration'
    );
  }, [selectedRole]);

  // Get unique dimensions from filtered questions
  const dimensions = useMemo(() => {
    const uniqueDimensions = new Map<string, Question[]>();
    filteredQuestions.forEach((q: Question) => {
      if (!uniqueDimensions.has(q.dimension)) {
        uniqueDimensions.set(q.dimension, []);
      }
      uniqueDimensions.get(q.dimension)!.push(q);
    });
    return Array.from(uniqueDimensions.entries());
  }, [filteredQuestions]);

  // Get current dimension questions
  const currentDimensionQuestions = useMemo(() => {
    if (dimensions.length === 0 || currentDimensionIndex >= dimensions.length) {
      return [];
    }
    return dimensions[currentDimensionIndex][1];
  }, [dimensions, currentDimensionIndex]);

  const currentDimensionName = useMemo(() => {
    if (dimensions.length === 0 || currentDimensionIndex >= dimensions.length) {
      return '';
    }
    return dimensions[currentDimensionIndex][0];
  }, [dimensions, currentDimensionIndex]);

  // Answer a question
  const answerQuestion = useCallback(
    (
      dimension: string,
      indicator: string,
      question: string,
      selectedOption: number,
      selectedText: string
    ) => {
      setAnswers((prev) => {
        const existingIndex = prev.findIndex(
          (a) =>
            a.dimension === dimension &&
            a.indicator === indicator &&
            a.question === question
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            dimension,
            indicator,
            question,
            selectedOption,
            selectedText,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              dimension,
              indicator,
              question,
              selectedOption,
              selectedText,
            },
          ];
        }
      });
    },
    []
  );

  // Get answer for a specific question
  const getAnswer = useCallback(
    (dimension: string, indicator: string, question: string) => {
      return answers.find(
        (a) =>
          a.dimension === dimension &&
          a.indicator === indicator &&
          a.question === question
      );
    },
    [answers]
  );

  // Calculate progress
  const progress = useMemo(() => {
    if (filteredQuestions.length === 0) return 0;
    return Math.round((answers.length / filteredQuestions.length) * 100);
  }, [answers, filteredQuestions]);

  // Get dimension progress
  const getDimensionProgress = useCallback(
    (dimensionName: string) => {
      const dimensionQuestions = filteredQuestions.filter(
        (q: Question) => q.dimension === dimensionName
      );
      if (dimensionQuestions.length === 0) return 0;

      const answeredCount = answers.filter(
        (a) => a.dimension === dimensionName
      ).length;
      return Math.round((answeredCount / dimensionQuestions.length) * 100);
    },
    [answers, filteredQuestions]
  );

  // Reset questionnaire
  const reset = useCallback(() => {
    setSelectedRole(null);
    setAnswers([]);
    setCurrentDimensionIndex(0);
    setUserInfo({ company: null, firstName: '', lastName: '' });
  }, []);

  // Export answers as JSON
  const exportAnswers = useCallback(() => {
    return JSON.stringify(
      {
        metadata: {
          company: userInfo.company,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          role: selectedRole,
          totalQuestions: filteredQuestions.length,
          answeredQuestions: answers.length,
          completionPercentage: progress,
          exportDate: new Date().toISOString(),
        },
        answers: answers.map((answer) => ({
          dimension: answer.dimension,
          indicator: answer.indicator,
          question: answer.question,
          selectedOption: answer.selectedOption,
          selectedText: answer.selectedText,
        })),
      },
      null,
      2
    );
  }, [selectedRole, filteredQuestions.length, answers, progress, userInfo]);

  return {
    selectedRole,
    setSelectedRole,
    userInfo,
    setUserInfo,
    answers,
    answerQuestion,
    getAnswer,
    roles,
    filteredQuestions,
    dimensions,
    currentDimensionIndex,
    setCurrentDimensionIndex,
    currentDimensionQuestions,
    currentDimensionName,
    progress,
    getDimensionProgress,
    reset,
    exportAnswers,
  };
}