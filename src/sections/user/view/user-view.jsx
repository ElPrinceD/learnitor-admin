import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

const dummyTopics = [
  { id: 1, name: 'Topic 1', description: 'Description 1' },
  { id: 2, name: 'Topic 2', description: 'Description 2' },
  { id: 3, name: 'Topic 3', description: 'Description 3' },
];

// Placeholder API calls
const getTopics = async (courseId) => dummyTopics;
const addTopic = async (courseId, topic) => ({ ...topic, id: Date.now() });
const updateTopic = async (topicId, updatedTopic) => updatedTopic;
const deleteTopic = async (topicId) => true;

export default function TopicsPage() {
  const { courseId } = useParams(); // Get courseId from URL
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchTopicsData = async () => {
      try {
        const topicsList = await getTopics(courseId);
        setTopics(topicsList);
      } catch (err) {
        setError('Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopicsData();
  }, [courseId]);

  const handleDialogOpen = () => {
    setOpenDialog(true);
    setError(null);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewTopic({ name: '', description: '' });
    setError(null);
    setIsEditMode(false);
    setSelectedTopicId(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewTopic({ ...newTopic, [name]: value });
  };

  const handleOpenDeleteDialog = (topicId) => {
    setTopicToDelete(topicId);
    setConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (topicToDelete) {
       await deleteTopic(topicToDelete);
      setTopics(topics.filter((topic) => topic.id !== topicToDelete));
        setConfirmDeleteDialogOpen(false);
      }
    } catch (err) {
      setError('Failed to delete topic');
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteDialogOpen(false);
    setTopicToDelete(null);
  };

  const handleAddTopic = async () => {
    try {
      if (isEditMode && selectedTopicId) {
        const updatedTopic = await updateTopic(selectedTopicId, newTopic);
        setTopics((prevTopics) =>
          prevTopics.map((topic) => (topic.id === selectedTopicId ? updatedTopic : topic))
        );
      } else {
        const addedTopic = await addTopic(courseId, newTopic);
        setTopics([...topics, addedTopic]);
      }
      handleDialogClose();
    } catch (err) {
      setError('Failed to save topic');
    }
  };

  const handleEditTopic = (topic) => {
    setIsEditMode(true);
    setSelectedTopicId(topic.id);
    setNewTopic(topic);
    setOpenDialog(true);
  };

 
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  if (loading) return <div>Loading topics...</div>;
  if (error && !openDialog) return <div>{error}</div>;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Topics</Typography>

        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleDialogOpen}
        >
          New Topic
        </Button>
      </Stack>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableBody>
                {topics
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell component="th" scope="row">
                        {topic.name}
                      </TableCell>
                      <TableCell align="left">{topic.description}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="text"
                            color="primary"
                            onClick={() => handleEditTopic(topic)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="text"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(topic.id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={topics.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{isEditMode ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newTopic.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={newTopic.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleAddTopic} color="primary">
            {isEditMode ? 'Update Topic' : 'Add Topic'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmDeleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this topic?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="error">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
