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
  const response = await apiClient.get(`/api/topics/${courseId}/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  return response.data;
};

// Fetch questions for a specific topic
export const getQuestionsForTopic = async (topicId, token) => {
  const response = await apiClient.get(`/api/questions/${topicId}/`, {
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
export const updateCourse = async (courseId, courseData, token) => {
  try {
    const response = await apiClient.put(`/api/courses/${courseId}/`, courseData, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update course', error);
    throw error;
  }
};

// Function to delete a course
export const deleteCourse = async (courseId, token) => {
  try {
    await apiClient.delete(`/api/courses/${courseId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
  } catch (error) {
    console.error('Failed to delete course', error);
    throw error;
  }
};
export const getCategories = async (token) => {
  try {
    const response = await apiClient.get('/api/categories', {
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

export const getTopicCount = async (token) => {
  try {
    const response = await apiClient.get('/api/topics/total/', {
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
