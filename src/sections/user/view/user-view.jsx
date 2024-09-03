import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

import  Box  from '@mui/material/Box';
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
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import AuthContext from 'src/context/auth-context';
import {
  addTopic,
  updateTopic,
  deleteTopic,
  getTopicsForCourse,
} from 'src/api-calls/topic-api';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';


export default function TopicsPage() {
  const router = useRouter();
  const { token } = useContext(AuthContext);
  const { courseId: courseIdString, courseTitle } = useParams();
  const courseId = Number(courseIdString); // or parseInt(courseIdString, 10);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);
  const [newTopic, setNewTopic] = useState({ title: '', description: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchTopicsData = async () => {
      try {
        const topicsList = await getTopicsForCourse(courseId, token);
        setTopics(topicsList);
      } catch (err) {
        setError('Failed to load topics');
      } finally {
        setLoading(false);
      }
    };

    fetchTopicsData();
  }, [token, courseId]);
  
  const handleTopicClick = (topicTitle, topicId) => {
    router.push(`/topics/${topicTitle}/${topicId}/topic-content`)
  }
  const handleDialogOpen = () => {
    setOpenDialog(true);
    setError(null);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewTopic({ title: '', description: '' });
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
        await deleteTopic(topicToDelete, token);
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
      const topicToAddOrUpdate = { ...newTopic, course: courseId };
      if (isEditMode && selectedTopicId) {
        const updatedTopic = await updateTopic(selectedTopicId, topicToAddOrUpdate, token);
        setTopics((prevTopics) =>
          prevTopics.map((topic) =>
            topic.id === selectedTopicId ? updatedTopic : topic
          )
        );
      } else {
        const addedTopic = await addTopic(topicToAddOrUpdate, token);
        setTopics([...topics, addedTopic]);
              console.log("bjmjmh", addedTopic)

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

 if (loading) {
     return (
       <Box
        sx={{
         display: 'flex',
          justifyContent: 'center',
         alignItems: 'center',
       }}
     >
       <CircularProgress />
     </Box>
     );
   }   if (error && !openDialog) return <div>{error}</div>;

  return (
    <Container>
       <Typography
        variant='h3'
        gutterBottom
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 2
        }}
      >
        {courseTitle}
      </Typography>
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
                    <TableRow key={topic.id} onClick={() => handleTopicClick(topic.title, topic.id)} style={{ cursor: 'pointer' }}>
                      <TableCell component="th" scope="row">
                        {topic.title}
                      </TableCell>
                      <TableCell align="left">{topic.description}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditTopic(topic); }}>
                            <Iconify icon="eva:edit-outline" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(topic.id); }}
                          >
                            <Iconify icon="eva:trash-2-outline" />
                          </IconButton>
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
            name="title"
            label="Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newTopic.title || ''}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={newTopic.description || ''}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleAddTopic} color="primary">
            {isEditMode ? 'Save Changes' : 'Add Topic'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this topic?
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
