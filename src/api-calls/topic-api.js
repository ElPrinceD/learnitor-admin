import apiClient from './api-client';

const TOPIC_API_BASE_URL = '/api/topics';

export const getTopicCount = async (token) => {
  try {
    const response = await apiClient.get(`${TOPIC_API_BASE_URL}/total/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch total number of topics', error);
    throw error;
  }
};

export const getTopicsForCourse = async (courseId, token) => {
  try {
    const response = await apiClient.get(`${TOPIC_API_BASE_URL}/?course_id=${courseId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch topics for course', error);
    throw error;
  }
};

export const addTopic = async (topic, token) => {
  try {
    const response = await apiClient.post(`${TOPIC_API_BASE_URL}/`, topic, {
      headers: {
        Authorization: `Token ${token}`,
        // 'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add topic', error);
    throw error;
  }
};

export const updateTopic = async (topicId, updatedTopic, token) => {
  try {
    const response = await apiClient.patch(`${TOPIC_API_BASE_URL}/${topicId}/`, updatedTopic, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update topic', error);
    throw error;
  }
};

export const deleteTopic = async (topicId, token) => {
  try {
    await apiClient.delete(`${TOPIC_API_BASE_URL}/${topicId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
  } catch (error) {
    console.error('Failed to delete topic', error);
    throw error;
  }
};

// Fetch questions for a specific topic
export const getQuestionsForTopic = async (topicId, token) => {
  try {
    const response = await apiClient.get(`/api/questions/?topic_id=${topicId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch questions for topic', error);
    throw error;
  }
};

export const getQuestionCount = async (token) => {
  try {
    const response = await apiClient.get('/api/questions/total/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch total number of questions', error);
    throw error;
  }
};
