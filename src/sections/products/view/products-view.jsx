import { useState, useEffect, useContext } from 'react';

import Alert from '@mui/material/Alert'; // Import Alert for error messages
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
// import ProductSort from '../product-sort';
import ProductFilters from '../product-filters';
import { addCourse, getCourses, getCategories, getTopicsForCourse, getQuestionsForTopic } from '../../../api-calls/course-api';

// ----------------------------------------------------------------------

export default function ProductsView() {
  const [openFilter, setOpenFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // State for dialog
  const [newCourse, setNewCourse] = useState({ title: '', description: '', url: '', category: [] });
  const { token } = useContext(AuthContext);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
    setError(null); // Clear any previous errors when opening the dialog
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setNewCourse({ title: '', description: '', url: '', category: [] }); // Reset the form on close
    setError(null); // Clear the error message on close
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleAddCourse = async () => {
    try {
      await addCourse(newCourse, token);
      setCourses([...courses, newCourse]); // Optionally, fetch again or update state
      setOpenDialog(false); // Close dialog on success
      setNewCourse({ title: '', description: '', url: '', category: [] }); // Reset the form after successful addition
    } catch (err) {
      setError('Failed to add course'); // Show error message inside the dialog
    }
  };

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const courseList = await getCourses(token);
        const coursesWithDetails = await Promise.all(
          courseList.map(async (course) => {
            const topics = await getTopicsForCourse(course.id, token);
            const topicsWithQuestionsCount = await Promise.all(
              topics.map(async (topic) => {
                const questions = await getQuestionsForTopic(topic.id, token);
                return { ...topic, questionCount: questions.length };
              })
            );

            return {
              ...course,
              topicCount: topics.length,
              topics: topicsWithQuestionsCount,
            };
          })
        );

        setCourses(coursesWithDetails);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesData();
  }, [token]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories(token);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, [token]);

  if (loading) return <div>Loading courses...</div>;
  if (error && !openDialog) return <div>{error}</div>; // Show the error outside the dialog only if it's not related to the dialog

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">
          Courses
        </Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleDialogOpen}>
          New Course
        </Button>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        flexWrap="wrap-reverse"
        justifyContent="flex-end"
        sx={{ mb: 5 }}
      >
        <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
          <ProductFilters
            openFilter={openFilter}
            onOpenFilter={handleOpenFilter}
            onCloseFilter={handleCloseFilter}
            categories={categories}
          />

          {/* <ProductSort /> */}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid key={course.id || course.title} xs={12} sm={6} md={3}>
            <ProductCard product={course} />
          </Grid>
        ))}
      </Grid>


      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New Course</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>} {/* Display error message inside the dialog */}
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
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddCourse} color="primary">
            Add Course
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
