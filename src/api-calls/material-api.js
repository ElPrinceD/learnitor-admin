import apiClient from './api-client';

const MATERIAL_API_BASE_URL = '/api/materials';

// Fetch the list of all materials
export const getMaterialsByTopic = async (topicId, token) => {
  try {
    const response = await apiClient.get(`${MATERIAL_API_BASE_URL}/?topic_id=${topicId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch materials for topic', error);
    throw error;
  }
};

// Create a new material
export const createMaterial = async (materialData, token) => {
  try {
    const response = await apiClient.post(`${MATERIAL_API_BASE_URL}/`, materialData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create material', error);
    throw error;
  }
};

// Update an existing material
export const updateMaterial = async (id, materialData, token) => {
  try {
    const response = await apiClient.patch(`${MATERIAL_API_BASE_URL}/${id}/`, materialData, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update material', error);
    throw error;
  }
};

// Delete a material
export const deleteMaterial = async (id, token) => {
  try {
    const response = await apiClient.delete(`${MATERIAL_API_BASE_URL}/${id}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to delete material', error);
    throw error;
  }
};
