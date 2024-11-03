import apiClient from './api-client';

// Base URL for course-related endpoints
const COURSE_API_BASE_URL = '/api/courses';

export const getCourses = async (token) => {
  try {
    const response = await apiClient.get(`${COURSE_API_BASE_URL}/`, {
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

export const addCourse = async (newCourse, token) => {
  try {
    const response = await apiClient.post(`${COURSE_API_BASE_URL}/`, newCourse, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add course', error);
    throw error;
  }
};

export const updateCourse = async (courseId, courseData, token) => {
  try {
    const response = await apiClient.patch(`${COURSE_API_BASE_URL}/${courseId}/`, courseData, {
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

export const deleteCourse = async (courseId, token) => {
  try {
    await apiClient.delete(`${COURSE_API_BASE_URL}/${courseId}/`, {
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
    const response = await apiClient.get('/api/categories/', {
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
