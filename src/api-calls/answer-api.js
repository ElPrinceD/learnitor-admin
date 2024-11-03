import apiClient from './api-client';

const ANSWER_API_BASE_URL = '/api/answers';

export const getAnswersByQuestion = async (questionId, token) => {
  try {
    const response = await apiClient.get(`${ANSWER_API_BASE_URL}/?question_id=${questionId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch answers for question', error);
    throw error;
  }
};

// Create a new answer for a specific question
export const createAnswer = async (answerData, token) => {
  try {
    const response = await apiClient.post(`${ANSWER_API_BASE_URL}/`, answerData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create answer', error);
    throw error;
  }
};

// Update an answer
export const updateAnswer = async (answerId, answerData, token) => {
  try {
    const response = await apiClient.patch(`${ANSWER_API_BASE_URL}/${answerId}/`, answerData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update answer', error);
    throw error;
  }
};

// Delete an answer
export const deleteAnswer = async (answerId, token) => {
  try {
    const response = await apiClient.delete(`${ANSWER_API_BASE_URL}/${answerId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete answer', error);
    throw error;
  }
};