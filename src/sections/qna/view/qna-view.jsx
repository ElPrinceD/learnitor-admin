import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Grid, Stack, Alert, Button,  Select, Dialog, MenuItem, Checkbox,
  TextField, Container,
   Typography, IconButton,DialogTitle,DialogContent, DialogActions, FormControlLabel,
} from '@mui/material';

import AuthContext from 'src/context/auth-context';
import {
  createAnswer, updateAnswer, deleteAnswer, getAnswersByQuestion
} from 'src/api-calls/answer-api';
import {
  createQuestion, updateQuestion, deleteQuestion, getQuestionsByTopic
} from 'src/api-calls/question-api';

export default function QuestionsAnswersView() {
  const { token } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [openAnswerDialog, setOpenAnswerDialog] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({ text: '', level: '', duration: '', topic: null });
  const [answerFormData, setAnswerFormData] = useState({ text: '', isRight: false, question: null });
  const [isQuestionEditMode, setIsQuestionEditMode] = useState(false);
  const [isAnswerEditMode, setIsAnswerEditMode] = useState(false);
  const [error, setError] = useState(null);
  const { topicId: topicIdString } = useParams();
  const topicId = Number(topicIdString);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestionsByTopic(topicId, token);
        setQuestions(data);
      } catch (err) {
        setError('Failed to load questions');
      }
    };
    fetchQuestions();
  }, [topicId, token]);

  const handleOpenQuestionDialog = () => {
    setOpenQuestionDialog(true);
    setError(null);
  };

  const handleCloseQuestionDialog = () => {
    setOpenQuestionDialog(false);
    setQuestionFormData({ text: '', level: '', duration: '', topic: null });
    setIsQuestionEditMode(false);
    setSelectedQuestionId(null);
  };

  const handleOpenAnswerDialog = (questionId) => {
    setSelectedQuestionId(questionId);
    setOpenAnswerDialog(true);
    setError(null);
  };

  const handleCloseAnswerDialog = () => {
    setOpenAnswerDialog(false);
    setAnswerFormData({ text: '', isRight: false, question: null });
    setIsAnswerEditMode(false);
  };

  const handleQuestionInputChange = (event) => {
    const { name, value } = event.target;
    setQuestionFormData({ ...questionFormData, [name]: value });
  };

  const handleAnswerInputChange = (event) => {
    const { name, value } = event.target;
    setAnswerFormData({ ...answerFormData, [name]: value });
  };

  const handleAddOrUpdateQuestion = async () => {
    try {
      questionFormData.topic = topicId; // Assign topic ID
      if (isQuestionEditMode && selectedQuestionId) {
        await updateQuestion(selectedQuestionId, questionFormData, token);
      } else {
        await createQuestion(questionFormData, token);
      }
      handleCloseQuestionDialog();
    } catch (err) {
      setError('Failed to save question');
    }
  };

  const handleAddOrUpdateAnswer = async () => {
    try {
      answerFormData.question = selectedQuestionId; // Assign question ID
      if (isAnswerEditMode) {
        await updateAnswer(answerFormData.question, answerFormData, token);
      } else {
        await createAnswer(answerFormData, token);
      }
      handleCloseAnswerDialog();
    } catch (err) {
      setError('Failed to save answer');
    }
  };

  const handleEditQuestion = (question) => {
    setIsQuestionEditMode(true);
    setQuestionFormData(question);
    setOpenQuestionDialog(true);
  };

  const handleDeleteQuestion = (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestionConfirmed(questionId);
    }
  };

  const deleteQuestionConfirmed = async (questionId) => {
    try {
      await deleteQuestion(questionId, token);
      setQuestions(questions.filter((q) => q.id !== questionId));
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  const handleEditAnswer = (answer) => {
    setIsAnswerEditMode(true);
    setAnswerFormData(answer);
    setOpenAnswerDialog(true);
  };

  const handleDeleteAnswer = (answerId) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      deleteAnswerConfirmed(answerId);
    }
  };

  const deleteAnswerConfirmed = async (answerId) => {
    try {
      await deleteAnswer(answerId, token);
      setAnswers(answers.filter((a) => a.id !== answerId));
    } catch (err) {
      setError('Failed to delete answer');
    }
  };

  const handleFetchAnswers = async (questionId) => {
    try {
      const data = await getAnswersByQuestion(questionId, token);
      setAnswers(data);
      setSelectedQuestionId(questionId);
    } catch (err) {
      setError('Failed to load answers');
    }
  };

  return (
    <Container>
      <Typography variant="h4">Questions & Answers</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2}>
        {questions.map((question) => (
          <Grid key={question.id} item xs={12}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">{question.text}</Typography>
              <div>
                <IconButton onClick={() => handleEditQuestion(question)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteQuestion(question.id)}>
                  <DeleteIcon />
                </IconButton>
                <Button variant="outlined" onClick={() => handleFetchAnswers(question.id)}>
                  View Answers
                </Button>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenAnswerDialog(question.id)}>
                  Add Answer
                </Button>
              </div>
            </Stack>
            {selectedQuestionId === question.id &&
              answers.map((answer) => (
                <Stack key={answer.id} direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="body1">{answer.text}</Typography>
                  <div>
                    <IconButton onClick={() => handleEditAnswer(answer)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteAnswer(answer.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </Stack>
              ))}
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenQuestionDialog}>
        Add Question
      </Button>

      {/* Dialog for adding/editing question */}
      <Dialog open={openQuestionDialog} onClose={handleCloseQuestionDialog}>
        <DialogTitle>{isQuestionEditMode ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="text"
            label="Question Text"
            type="text"
            fullWidth
            variant="outlined"
            value={questionFormData.text}
            onChange={handleQuestionInputChange}
            inputProps={{ spellCheck: 'true' }} // Enable spell check
          />
          <Select
            margin="dense"
            name="level"
            label="Level"
            fullWidth
            variant="outlined"
            value={questionFormData.level}
            onChange={handleQuestionInputChange}
          >
            <MenuItem value="Beginner">Beginner</MenuItem>
            <MenuItem value="Intermediate">Intermediate</MenuItem>
            <MenuItem value="Advanced">Advanced</MenuItem>
            <MenuItem value="Master">Master</MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="duration"
            label="Duration"
            type="text"
            fullWidth
            variant="outlined"
            value={questionFormData.duration}
            onChange={handleQuestionInputChange}
          />
        </DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <DialogActions>
          <Button onClick={handleCloseQuestionDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddOrUpdateQuestion} color="primary">
            {isQuestionEditMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding/editing answer */}
      <Dialog open={openAnswerDialog} onClose={handleCloseAnswerDialog}>
        <DialogTitle>{isAnswerEditMode ? 'Edit Answer' : 'Add New Answer'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="text"
            label="Answer Text"
            type="text"
            fullWidth
            variant="outlined"
            value={answerFormData.text}
            onChange={handleAnswerInputChange}
            inputProps={{ spellCheck: 'true' }} // Enable spell check
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={answerFormData.isRight}
                onChange={(event) =>
                  setAnswerFormData({ ...answerFormData, isRight: event.target.checked })
                }
                name="isRight"
                color="primary"
              />
            }
            label="Correct Answer"
          />
        </DialogContent>
        {error && <Alert severity="error">{error}</Alert>}
        <DialogActions>
          <Button onClick={handleCloseAnswerDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleAddOrUpdateAnswer} color="primary">
            {isAnswerEditMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
