import { useParams } from 'react-router-dom';

import Stack from '@mui/material/Stack';
// import Button from '@mui/material/Button';

import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export default function BlogView() {
  const router = useRouter();
  const { topicId: topicIdString, topicTitle } = useParams();
  const topicId = Number(topicIdString);

  const handleNavigation = (path) => {
    router.push(`/topic-content/${topicTitle}/${topicId}/${path}`);
  };

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
        {topicTitle}
      </Typography>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Topic Overview</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={6}>
          <Card>
            <CardActionArea onClick={() => handleNavigation('materials')}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Materials
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={6}>
          <Card>
            <CardActionArea onClick={() => handleNavigation('levels')}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Questions and Answers
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
