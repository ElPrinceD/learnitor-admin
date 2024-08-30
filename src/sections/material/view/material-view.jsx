import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, TablePagination, Alert, Link
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import AuthContext from 'src/context/auth-context';
import { getMaterialsByTopic, createMaterial, updateMaterial, deleteMaterial } from 'src/api-calls/material-api';

import Iconify from 'src/components/iconify';

export default function MaterialsView() {
  const { token } = useContext(AuthContext);
  const { topicId: topicIdString } = useParams();
  const topicId = Number(topicIdString);

  const [materials, setMaterials] = useState([]);
  const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
  const [materialFormData, setMaterialFormData] = useState({ name: '', link: '', type: 'video' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editMaterialId, setEditMaterialId] = useState(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [deleteMaterialId, setDeleteMaterialId] = useState(null);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch materials and sort them by type
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        let data = await getMaterialsByTopic(topicId, token);
        data = data.sort((a, b) => a.type.localeCompare(b.type)); // Sort materials by type
        setMaterials(data);
      } catch (err) {
        setError('Failed to load materials');
      }
    };
    fetchMaterials();
  }, [topicId, token]);

  const handleOpenMaterialDialog = () => {
    setOpenMaterialDialog(true);
    setError(null);
  };

  const handleCloseMaterialDialog = () => {
    setOpenMaterialDialog(false);
    setMaterialFormData({ name: '', link: '', type: 'video' });
    setIsEditMode(false);
    setEditMaterialId(null);
  };

  const handleMaterialInputChange = (event) => {
    const { name, value } = event.target;
    setMaterialFormData({ ...materialFormData, [name]: value });
  };

  const handleAddOrUpdateMaterial = async () => {
    try {
      const materialData = { ...materialFormData, topic: topicId };

      if (isEditMode && editMaterialId) {
        await updateMaterial(editMaterialId, materialData, token);
      } else {
        await createMaterial(materialData, token);
      }
      handleCloseMaterialDialog();
      const updatedMaterials = await getMaterialsByTopic(topicId, token);
      updatedMaterials.sort((a, b) => a.type.localeCompare(b.type)); // Sort materials by type
      setMaterials(updatedMaterials);
    } catch (err) {
      setError('Failed to save material');
    }
  };

  const handleEditMaterial = (material) => {
    setIsEditMode(true);
    setMaterialFormData({ ...material });
    setEditMaterialId(material.id);
    setOpenMaterialDialog(true);
  };

  const handleDeleteMaterial = (materialId) => {
    setDeleteMaterialId(materialId);
    setConfirmDeleteDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteDialogOpen(false);
    setDeleteMaterialId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMaterial(deleteMaterialId, token);
      const updatedMaterials = await getMaterialsByTopic(topicId, token);
      updatedMaterials.sort((a, b) => a.type.localeCompare(b.type)); // Sort materials by type
      setMaterials(updatedMaterials);
      setConfirmDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete material');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container>
      <h2>Materials</h2>
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenMaterialDialog} style={{ marginBottom: '16px' }}>
        Add Material
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Material Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materials.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((material) => (
              <TableRow key={material.id}>
                <TableCell>
                  <Link 
                    href={material.link} 
                    target="_blank" 
                    rel="noopener" 
                    color="inherit" 
                    underline="hover" 
                    variant="subtitle2" 
                    noWrap
                  >
                    {material.name}
                  </Link>
                </TableCell>
                <TableCell>{material.type}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleEditMaterial(material)}>
                    <Iconify icon="eva:edit-outline" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    <Iconify icon="eva:trash-2-outline" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={materials.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Dialog for adding/editing material */}
      <Dialog open={openMaterialDialog} onClose={handleCloseMaterialDialog}>
        <DialogTitle>{isEditMode ? 'Edit Material' : 'Add New Material'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Material Name"
            type="text"
            fullWidth
            variant="outlined"
            value={materialFormData.name}
            onChange={handleMaterialInputChange}
          />
          <TextField
            margin="dense"
            name="link"
            label="Material Link"
            type="url"
            fullWidth
            variant="outlined"
            value={materialFormData.link}
            onChange={handleMaterialInputChange}
          />
          <TextField
            select
            margin="dense"
            name="type"
            label="Material Type"
            fullWidth
            variant="outlined"
            value={materialFormData.type}
            onChange={handleMaterialInputChange}
            SelectProps={{ native: true }}
          >
            <option value="video">Video</option>
            <option value="journal">Article (Journal)</option>
            <option value="book">Book</option>
            <option value="slides">Slides</option>
          </TextField>
        </DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <DialogActions>
          <Button onClick={handleCloseMaterialDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddOrUpdateMaterial} color="primary">
            {isEditMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this material?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
