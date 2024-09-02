import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined';

import { useRouter } from 'src/routes/hooks';

export default function ShopProductCard({ product, onEdit, onDelete }) {
    const router = useRouter();

  const handleCardClick = (e) => {
    // Prevent triggering navigation if an edit or delete button is clicked
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'svg' && e.target.tagName !== 'path') {
      router.push(`/courses/${product.title}/${product.id}/topics`);
    }
  };

  const renderImg = (
    <Box
      component="img"
      alt={LibraryBooksIcon}
      src={product.url}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  return (
    <Card onClick={handleCardClick} sx={{ cursor: 'pointer' }}>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.title}
        </Link>
           
        <Typography variant="body2" color="text.secondary">
          {product.description}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <LibraryBooksIcon />
          <Typography variant="body2">
            {product.topicCount || 0}
          </Typography>
          <PsychologyAltOutlinedIcon />
          <Typography variant="body2">
            {/* Check if product.topics is an array before calling reduce */}
            {(product.topics && Array.isArray(product.topics)) 
              ? product.topics.reduce((acc, topic) => acc + topic.questionCount, 0)
              : 0}
          </Typography>
        </Stack>

        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Button variant="text" color="primary" onClick={() => onEdit(product)}>
            Edit
          </Button>
          <Button
            variant="text"
            color= "error"
            onClick={() => onDelete(product.id)}
          >
            Delete
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    url: PropTypes.string,
    topicCount: PropTypes.number,
    id: PropTypes.number,
    topics: PropTypes.arrayOf(
      PropTypes.shape({
        questionCount: PropTypes.number,
      })
    ),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
