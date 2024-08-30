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

export default function LevelsView() {
  const router = useRouter();
  const { topicId: topicIdString } = useParams();
  const topicId = Number(topicIdString);

  const handleNavigation = (level) => {
  router.push(`/topic-content/${topicId}/levels/${level}/questions-answers`);
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Select Level</Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={6}>
          <Card>
            <CardActionArea onClick={() => handleNavigation('Beginner')}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Beginner
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={6}>
          <Card>
            <CardActionArea onClick={() => handleNavigation('Intermediate')}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Intermediate
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={6}>
          <Card>
            <CardActionArea onClick={() => handleNavigation('Master')}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Master
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={6}>
          <Card>
            <CardActionArea onClick={() => handleNavigation('Advanced')}>
              <CardContent>
                <Typography variant="h5" component="div">
                  Advanced
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
