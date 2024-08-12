import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PsychologyAltOutlinedIcon from '@mui/icons-material/PsychologyAltOutlined';

export default function ShopProductCard({ product }) {
  const renderImg = (
    <Box
      component="img"
      alt={product.title}
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
    <Card>
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
      </Stack>
    </Card>
  );
}

ShopProductCard.propTypes = {
  product: PropTypes.object.isRequired,
};
