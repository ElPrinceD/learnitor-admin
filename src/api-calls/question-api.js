import apiClient from './api-client';

const QUESTION_API_BASE_URL = '/api/questions';


export const getQuestionsByTopic = async (topicId, token) => {
  try {
    const response = await apiClient.get(`${QUESTION_API_BASE_URL}/by_topics/?topic_id=${topicId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch questions by topic', error);
    throw error;
  }
};


// Create a new question
export const createQuestion = async (questionData, token) => {
  try {
    const response = await apiClient.post(`${QUESTION_API_BASE_URL}/`, questionData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create question', error);
    throw error;
  }
};

// Update a question
export const updateQuestion = async (questionId, questionData, token) => {
  try {
    const response = await apiClient.put(`${QUESTION_API_BASE_URL}/${questionId}/`, questionData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update question', error);
    throw error;
  }
};

// Delete a question
export const deleteQuestion = async (questionId, token) => {
  try {
    const response = await apiClient.delete(`${QUESTION_API_BASE_URL}/${questionId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete question', error);
    throw error;
  }
};

