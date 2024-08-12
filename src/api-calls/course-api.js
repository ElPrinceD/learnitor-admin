import apiClient from './api-client';

// Function to fetch all courses
export const getCourses = async (token) => {
  try {
    const response = await apiClient.get('/api/course/all/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch courses', error);
    throw error;
  }
};


export const getTopicsForCourse = async (courseId, token) => {
  const response = await apiClient.get(`/api/course/${courseId}/topics/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

// Fetch questions for a specific topic
export const getQuestionsForTopic = async (topicId, token) => {
  const response = await apiClient.get(`/api/course/topic/${topicId}/questions/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};
export const addCourse = async (newCourse,token) => {
  try {
    const response = await apiClient.post('/api/course/all/', newCourse, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch courses', error);
    throw error;
  }
};

export const getCategories = async (token) => {
  try {
    const response = await apiClient.get('/api/category/all/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch categories', error);
    throw error;
  }
};