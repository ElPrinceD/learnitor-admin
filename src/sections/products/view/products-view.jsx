import { useState, useEffect, useContext } from 'react';

import  Box  from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import AuthContext from 'src/context/auth-context';
import { getTopicsForCourse, getQuestionsForTopic } from 'src/api-calls/topic-api';
import { addCourse, getCourses, updateCourse, deleteCourse } from 'src/api-calls/course-api';
import { addCategory, getCategories, updateCategory, deleteCategory } from 'src/api-calls/category-api';

import Iconify from 'src/components/iconify';

import ProductCard from '../product-card';
import ProductFilters from '../product-filters';

// ----------------------------------------------------------------------

export default function ProductsView() {
  const [openFilter, setOpenFilter] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', url: '', category: [] });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [isCategoryEditMode, setIsCategoryEditMode] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [confirmDeleteCategoryDialogOpen, setConfirmDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { token } = useContext(AuthContext);

  const handleOpenFilter = () => {
    setOpenFilter(true);
  };

  const handleCloseFilter = () => {
    setOpenFilter(false);
  };

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

  const handleCategoryDialogOpen = () => {
    setCategoryDialogOpen(true);
    setError(null);
  };

  const handleCategoryDialogClose = () => {
    setCategoryDialogOpen(false);
    setNewCategory({ name: '' });
    setError(null);
    setIsCategoryEditMode(false);
    setSelectedCategoryId(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewCourse({ ...newCourse, [name]: value });
  };

  const handleCategoryChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewCourse({ ...newCourse, category: typeof value === 'string' ? value.split(',') : value });
  };

  const handleAddCourse = async () => {
    try {
      if (isEditMode && selectedCourseId) {
        const updatedCourse = await updateCourse(selectedCourseId, newCourse, token);
        setCourses((prevCourses) =>
          prevCourses.map((course) => (course.id === selectedCourseId ? updatedCourse : course))
        );
      } else {
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

  const handleCategorySelection = (newSelectedCategories) => {
    setSelectedCategoryIds(newSelectedCategories);
  };

  const handleCategoryInputChange = (event) => {
    const { name, value } = event.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleAddCategory = async () => {
    try {
      if (isCategoryEditMode && selectedCategoryId) {
        const updatedCategory = await updateCategory(selectedCategoryId, newCategory, token);
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.id === selectedCategoryId ? updatedCategory : category
          )
        );
      } else {
        const addedCategory = await addCategory(newCategory, token);
        setCategories([...categories, addedCategory]);
      }
      handleCategoryDialogClose();
    } catch (err) {
      setError('Failed to save category');
    }
  };

  const handleEditCategory = (category) => {
    setIsCategoryEditMode(true);
    setSelectedCategoryId(category.id);
    setNewCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleOpenDeleteCategoryDialog = (categoryId) => {
    setCategoryToDelete(categoryId);
    setConfirmDeleteCategoryDialogOpen(true);
  };

  const handleConfirmDeleteCategory = async () => {
    try {
      if (categoryToDelete) {
        await deleteCategory(categoryToDelete, token);
        setCategories(categories.filter((category) => category.id !== categoryToDelete));
        setConfirmDeleteCategoryDialogOpen(false);
      }
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const handleCancelDeleteCategory = () => {
    setConfirmDeleteCategoryDialogOpen(false);
    setCategoryToDelete(null);
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

  useEffect(() => {
    if (selectedCategoryIds.length > 0) {
      setFilteredCourses(
        courses.filter((course) => course.category.some((cat) => selectedCategoryIds.includes(cat)))
      );
    } else {
      setFilteredCourses(courses);
    }
  }, [selectedCategoryIds, courses]);

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
   } 
  if (error) return <Alert severity="error">{error}</Alert>;

 

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Courses</Typography>
        <Stack direction="row" flexWrap="wrap-reverse" alignItems="center" justifyContent="flex-end" sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Button variant="contained" onClick={handleDialogOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
              New Course
            </Button>
            <Button variant="contained" onClick={handleCategoryDialogOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
              New Program
            </Button>
          </Stack>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" flexWrap="wrap-reverse" justifyContent="flex-end" sx={{ mb: 5 }}>
        <Stack direction="row" spacing={1} flexShrink={0} >
          <ProductFilters
            openFilter={openFilter}
            onOpenFilter={handleOpenFilter}
            onCloseFilter={handleCloseFilter}
            onCategorySelection={handleCategorySelection}
            categories={categories}
            selectedCategories={selectedCategoryIds}
            handleEditCategory={handleEditCategory}
            handleDeleteCategory={handleOpenDeleteCategoryDialog}
          />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid key={course.id} xs={12} sm={6} md={3}>
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
            label="Image URL"
            type="text"
            fullWidth
            variant="outlined"
            value={newCourse.url}
            onChange={handleInputChange}
          />
          <Select
            labelId="category-select-label"
            id="category-select"
            label="Select Program(s)"
            multiple
            value={newCourse.category}
            onChange={handleCategoryChange}
            fullWidth
            renderValue={(selected) => selected.map((catId) => categories.find((cat) => cat.id === catId)?.name).join(', ')}>
            {categories.map((category) => (
              <MenuItem
                key={category.id}
                value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleAddCourse} color="primary">
            {isEditMode ? 'Save Changes' : 'Add Course'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={categoryDialogOpen}
        onClose={handleCategoryDialogClose}
        >
        <DialogTitle>{isCategoryEditMode ? 'Edit Program' : 'Add Program'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            name="name"
            label="Title"
            type="text"
            fullWidth
            value={newCategory.name}
            onChange={handleCategoryInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCategoryDialogClose} color='error'>
            Cancel
          </Button>
          <Button onClick={handleAddCategory} color='primary'>
            {isCategoryEditMode ? 'Save Changes' : 'Add Program'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Deletion</DialogTitle>
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

      <Dialog open={confirmDeleteCategoryDialogOpen} onClose={handleCancelDeleteCategory}>
    <DialogTitle>Confirm Deletion</DialogTitle>
    <DialogContent>
      <Typography>Are you sure you want to delete this program?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCancelDeleteCategory}>Cancel</Button>
      <Button onClick={handleConfirmDeleteCategory} color="error">
        Delete
      </Button>
    </DialogActions>
  </Dialog>

    </Container>
  );
}
