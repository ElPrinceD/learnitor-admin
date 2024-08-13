import { useState, useEffect, useContext } from 'react';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import AuthContext from 'src/context/auth-context';

import Iconify from 'src/components/iconify';

import ProductCard from '../product-card';
import {
  addCourse,
  getCourses,
  updateCourse,
  deleteCourse,
  // getCategories,
  // getTopicsForCourse,
  // getQuestionsForTopic,
} from '../../../api-calls/course-api';

// ----------------------------------------------------------------------

export default function ProductsView() {
  // const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', url: '', category: [] });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const { token } = useContext(AuthContext);

  const handleDialogOpen = () => {
    setOpenDialog(true);
    setError(null);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewCourse({ title: '', description: '', url: '', category: [] });
    setError(null);
    setIsEditMode(false);
    setSelectedCourseId(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleAddCourse = async () => {
    try {
      if (isEditMode && selectedCourseId) {
        // Update course
        const updatedCourse = await updateCourse(selectedCourseId, newCourse, token);
        setCourses((prevCourses) =>
          prevCourses.map((course) => (course.id === selectedCourseId ? updatedCourse : course))
        );
      } else {
        // Add new course
        const addedCourse = await addCourse(newCourse, token);
        setCourses([...courses, addedCourse]);
      }
      handleDialogClose();
    } catch (err) {
      setError('Failed to save course');
    }
  };

  const handleEditCourse = (course) => {
    setIsEditMode(true);
    setSelectedCourseId(course.id);
    setNewCourse(course);
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (courseId) => {
    setCourseToDelete(courseId);
    setConfirmDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (courseToDelete) {
        await deleteCourse(courseToDelete, token);
        setCourses(courses.filter((course) => course.id !== courseToDelete));
        setConfirmDeleteDialogOpen(false);
      }
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const courseList = await getCourses(token);
        setCourses(courseList);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, [token]);

  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     try {
  //       const categoriesData = await getCategories(token);
  //       setCategories(categoriesData);
  //     } catch (err) {
  //       console.error('Failed to fetch categories:', err);
  //     }
  //   };

  //   fetchCategories();
  // }, [token]);

  if (loading) return <div>Loading courses...</div>;
  if (error && !openDialog) return <div>{error}</div>;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">Courses</Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={handleDialogOpen}
        >
          New Course
        </Button>
      </Stack>

      <Stack direction="row" alignItems="center" flexWrap="wrap-reverse" justifyContent="flex-end" sx={{ mb: 5 }}>
        <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
          {/* Product Filters and Sort can be added here */}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid key={course.id || course.title} xs={12} sm={6} md={3}>
            <ProductCard
              product={course}
              onEdit={handleEditCourse}
              onDelete={handleOpenDeleteDialog}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{isEditMode ? 'Edit Course' : 'Add New Course'}</DialogTitle>
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
            value={newCourse.title}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.description}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="url"
            label="URL"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.url}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="category"
            label="Category"
            type="number"
            fullWidth
            variant="outlined"
            value={newCourse.category}
            onChange={(e) => setNewCourse({ ...newCourse, category: [e.target.value] })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleAddCourse} color="primary">
            {isEditMode ? 'Update Course' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this course?</Typography>
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
