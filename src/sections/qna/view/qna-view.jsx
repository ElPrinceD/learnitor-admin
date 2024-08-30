import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';

import AddIcon from '@mui/icons-material/Add';
import {
  Grid, Stack, Alert, Button, Dialog, Checkbox,
  TextField, Container, Typography, IconButton,
  DialogTitle, DialogContent, DialogActions, FormControlLabel,
} from '@mui/material';

import AuthContext from 'src/context/auth-context';
import {
  createAnswer, updateAnswer, deleteAnswer, getAnswersByQuestion
} from 'src/api-calls/answer-api';
import {
  createQuestion, updateQuestion, deleteQuestion, getQuestionsByTopic
} from 'src/api-calls/question-api';

import Iconify from 'src/components/iconify';


export default function QuestionsAnswersView() {
  const { token } = useContext(AuthContext);
  const { topicId: topicIdString, level } = useParams();  // Extract level from URL params
  const topicId = Number(topicIdString);

  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [openAnswerDialog, setOpenAnswerDialog] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({ text: '', duration: '', topic: null });
  const [answerFormData, setAnswerFormData] = useState({ text: '', isRight: false, question: null });
  const [isQuestionEditMode, setIsQuestionEditMode] = useState(false);
  const [isAnswerEditMode, setIsAnswerEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [confirmDeleteAnswerDialogOpen, setConfirmDeleteAnswerDialogOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null); // Store the ID of the question to delete
  const [deleteAnswerId, setDeleteAnswerId] = useState(null); // Store the ID of the answer to delete

  // Fetch questions with filtering by level
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestionsByTopic(topicId, token);
        // Filter questions by level
        const filteredQuestions = data.filter(question => question.level === level);
        setQuestions(filteredQuestions);
      } catch (err) {
        setError('Failed to load questions');
      }
    };
    fetchQuestions();
  }, [topicId, token, level]);

  // Fetch answers for a specific question
  const handleFetchAnswers = async (questionId) => {
    try {
      const data = await getAnswersByQuestion(questionId, token);
      setAnswers(data);
      setSelectedQuestionId(questionId);  // Ensure answers are linked to the correct question
    } catch (err) {
      setError('Failed to load answers');
    }
  };

  const handleOpenQuestionDialog = () => {
    setOpenQuestionDialog(true);
    setError(null);
  };

  const handleCloseQuestionDialog = () => {
    setOpenQuestionDialog(false);
    setQuestionFormData({ text: '', duration: '', topic: null });
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
      questionFormData.level = level; // Assign level from URL
      if (isQuestionEditMode && selectedQuestionId) {
        await updateQuestion(selectedQuestionId, questionFormData, token);
      } else {
        await createQuestion(questionFormData, token);
      }
      handleCloseQuestionDialog();
      // Update the list of questions after creation or update
      const updatedQuestions = await getQuestionsByTopic(topicId, token);
      const filteredQuestions = updatedQuestions.filter(q => q.level === level);
      setQuestions(filteredQuestions);
    } catch (err) {
      setError('Failed to save question');
    }
  };

  const handleAddOrUpdateAnswer = async () => {
    try {
      answerFormData.question = selectedQuestionId; // Assign question ID
      if (isAnswerEditMode && answerFormData.id) {
        await updateAnswer(answerFormData.id, answerFormData, token); // Use the correct answer ID
      } else {
        await createAnswer(answerFormData, token);
      }
      handleCloseAnswerDialog();
      // Refresh answers list after addition or update
      const updatedAnswers = await getAnswersByQuestion(selectedQuestionId, token);
      setAnswers(updatedAnswers);
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
    setDeleteQuestionId(questionId); // Set the ID of the question to delete
    setConfirmDeleteDialogOpen(true); // Open the confirmation dialog
  };

  const handleCancelDelete = () => {
    setConfirmDeleteDialogOpen(false);
    setDeleteQuestionId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteQuestion(deleteQuestionId, token);
      // Update the list of questions after deletion
      const updatedQuestions = await getQuestionsByTopic(topicId, token);
      const filteredQuestions = updatedQuestions.filter(q => q.level === level);
      setQuestions(filteredQuestions);
      setConfirmDeleteDialogOpen(false);
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
    setDeleteAnswerId(answerId); // Set the ID of the answer to delete
    setConfirmDeleteAnswerDialogOpen(true); // Open the confirmation dialog for answers
  };

  const handleCancelDeleteAnswer = () => {
    setConfirmDeleteAnswerDialogOpen(false);
    setDeleteAnswerId(null);
  };

  const handleConfirmDeleteAnswer = async () => {
    try {
      await deleteAnswer(deleteAnswerId, token);
      // Update the list of answers after deletion
      const updatedAnswers = await getAnswersByQuestion(selectedQuestionId, token);
      setAnswers(updatedAnswers);
      setConfirmDeleteAnswerDialogOpen(false);
    } catch (err) {
      setError('Failed to delete answer');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>{level.charAt(0).toUpperCase() + level.slice(1)} Questions ({questions.length})</Typography>
      {questions.length === 0 && <Typography>No questions set.</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2}>
        {questions.map((question) => (
          <Grid key={question.id} item xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h6">{question.text}</Typography>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditQuestion(question); }}>
                  <Iconify icon="eva:edit-outline" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(question.id); }}
                >
                  <Iconify icon="eva:trash-2-outline" />
                </IconButton>
                <Button variant="outlined" onClick={() => handleFetchAnswers(question.id)} style={{ marginRight: '8px' }}>
                  View Answers
                </Button>
                <Button variant="contained" color="primary" onClick={() => handleOpenAnswerDialog(question.id)}>
                  Add Answer
                </Button>
              </div>
            </Stack>
            {selectedQuestionId === question.id && (
              <div style={{ paddingLeft: '16px', paddingTop: '8px', marginBottom: '16px' }}>
                {answers.length === 0 ? (
                  <Typography>No answers added.</Typography>
                ) : (
                  <ul>
                    {answers.map((answer) => (
                      <li key={answer.id}>
                        {answer.text}
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditAnswer(answer); }}>
                          <Iconify icon="eva:edit-outline" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => { e.stopPropagation(); handleDeleteAnswer(answer.id); }}
                        >
                          <Iconify icon="eva:trash-2-outline" />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Grid>
        ))}
      </Grid>
      <div style={{ marginTop: '24px' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenQuestionDialog}>
          Add Question
        </Button>
      </div>

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
          <TextField
            margin="dense"
            name="duration"
            label="Duration (seconds)"
            type="text"
            fullWidth
            variant="outlined"
            value={questionFormData.duration} // Pre-fill with current value
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

      {/* Confirm delete question dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this question?
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

      {/* Confirm delete answer dialog */}
      <Dialog open={confirmDeleteAnswerDialogOpen} onClose={handleCancelDeleteAnswer}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this answer?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteAnswer} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDeleteAnswer} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
