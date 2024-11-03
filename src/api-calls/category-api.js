import apiClient from './api-client';

const CATEGORY_API_BASE_URL = '/api/categories';

export const getCategories = async (token) => {
  try {
    const response = await apiClient.get(`${CATEGORY_API_BASE_URL}/`, {
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

export const addCategory = async (category, token) => {
  try {
    const response = await apiClient.post(`${CATEGORY_API_BASE_URL}/`, category, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to add category', error);
    throw error;
  }
};

export const updateCategory = async (categoryId, category, token) => {
  try {
    const response = await apiClient.patch(`${CATEGORY_API_BASE_URL}/${categoryId}/`, category, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update category', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId, token) => {
  try {
    const response = await apiClient.delete(`${CATEGORY_API_BASE_URL}/${categoryId}/`, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete category', error);
    throw error;
  }
};
