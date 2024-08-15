import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

export default function ProductFilters({
  openFilter,
  onOpenFilter,
  onCloseFilter,
  categories,
  selectedCategories,
  onCategorySelection,
  handleEditCategory,
  handleDeleteCategory,
}) {
  const handleCategoryToggle = (categoryId) => {
    const currentIndex = selectedCategories.indexOf(categoryId);
    const newSelectedCategories = [...selectedCategories];

    if (currentIndex === -1) {
      newSelectedCategories.push(categoryId);
    } else {
      newSelectedCategories.splice(currentIndex, 1);
    }

    onCategorySelection(newSelectedCategories);
  };

  const renderCategory = (
    <Stack spacing={1}>
      <Typography variant="h5">Programs</Typography>
      {categories.map((category) => (
        <Stack
          key={category.id}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <FormControlLabel
             sx={{flex:1}}
          
            control={
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
              />
            }
            label={category.name}
          />
          <Box>
            <IconButton size="small" onClick={() => handleEditCategory(category)}>
              <Iconify icon="eva:edit-outline" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteCategory(category.id)}
            >
              <Iconify icon="eva:trash-2-outline" />
            </IconButton>
          </Box>
        </Stack>
      ))}
    </Stack>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={<Iconify icon="ic:round-filter-list" />}
        onClick={onOpenFilter}
      >
        Programs&nbsp;
      </Button>

      <Drawer
        anchor="right"
        open={openFilter}
        onClose={onCloseFilter}
        PaperProps={{
          sx: { width: 280, border: 'none', overflow: 'hidden' },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1, py: 2 }}
        >
          <Typography variant="h6" sx={{ ml: 1 }}>
            Programs
          </Typography>
          <IconButton onClick={onCloseFilter}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Stack>

        <Divider />

        <Scrollbar>
          <Stack spacing={3} sx={{ p: 3 }}>
            {renderCategory}
            {/* Render other filter options here, e.g., Gender, Price, etc. */}
          </Stack>
        </Scrollbar>

        <Box sx={{ p: 3 }}>
          <Button
            fullWidth
            size="large"
            type="submit"
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon="ic:round-clear-all" />}
            onClick={() => onCategorySelection([])} // Reset categories
          >
            Clear All
          </Button>
        </Box>
      </Drawer>
    </>
  );
}

ProductFilters.propTypes = {
  openFilter: PropTypes.bool,
  onOpenFilter: PropTypes.func,
  onCloseFilter: PropTypes.func,
  categories: PropTypes.array.isRequired,
  selectedCategories: PropTypes.array.isRequired, // Array of selected category IDs
  onCategorySelection: PropTypes.func.isRequired, // Handler for selection change
  handleEditCategory: PropTypes.func.isRequired,
  handleDeleteCategory: PropTypes.func.isRequired,
};