import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import AddIcon from '@mui/icons-material/Add';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import AuthContext from 'src/context/auth-context';
import {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  getAnswersByQuestion,
} from 'src/api-calls/answer-api';
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByTopic,
} from 'src/api-calls/question-api';

import Iconify from 'src/components/iconify';

// Component to render formulas using MathJax
const config = {
  loader: { load: ['input/asciimath', 'output/chtml', '[tex]/mhchem'] }, // Load mhchem for chemistry
  tex: {
    packages: { '[+]': ['mhchem'] }, // Enable the mhchem package
  },
};

const FormulaRenderer = ({ formula }) => (
  <MathJaxContext version={3} config={config}>
    <MathJax dynamic inline>{`\\(${formula}\\)`}</MathJax>
  </MathJaxContext>
);
const isFormula = (text) => {
  const formulaRegex = /(\$\$.*?\$\$|\\\(.+?\\\)|\\\[.+?\\\])/g; // Adjusted regex to match TeX delimiters
  return formulaRegex.test(text);
};

const splitTextWithFormulas = (text) => {
  const formulaRegex = /(\$\$(.*?)\$\$|\\\((.*?)\\\)|\\\[(.*?)\\\])/g;
  const parts = [];
  let lastIndex = 0;

  text.replace(formulaRegex, (match, p1, p2, p3, p4, index) => {
    // Add plain text before the formula
    if (index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, index), isFormula: false });
    }

    // Add the formula content without the delimiters
    const formulaContent = p2 || p3 || p4; // Extract content inside the matched delimiters
    parts.push({ text: formulaContent, isFormula: true });

    lastIndex = index + match.length;
  });

  // Add remaining plain text after the last formula
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isFormula: false });
  }

  return parts;
};

// Component to render text with formulas
const TextWithFormulas = ({ text }) => {
  const parts = splitTextWithFormulas(text);
  return (
    <>
      {parts.map((part, index) =>
        part.isFormula ? (
          <FormulaRenderer key={index} formula={part.text} />
        ) : (
          <span key={index}>{part.text}</span>
        )
      )}
    </>
  );
};
TextWithFormulas.propTypes = {
  text: PropTypes.string.isRequired,
};
FormulaRenderer.propTypes = {
  formula: PropTypes.string.isRequired,
};

export default function QuestionsAnswersView() {
  const { token } = useContext(AuthContext);
  const { topicId: topicIdString, level, topicTitle } = useParams(); // Extract level from URL params
  const topicId = Number(topicIdString);

  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);
  const [openAnswerDialog, setOpenAnswerDialog] = useState(false);
  const [questionFormData, setQuestionFormData] = useState({ text: '', duration: '', topic: null });
  const [answerFormData, setAnswerFormData] = useState({
    text: '',
    isRight: false,
    question: null,
  });
  const [isQuestionEditMode, setIsQuestionEditMode] = useState(false);
  const [isAnswerEditMode, setIsAnswerEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [confirmDeleteAnswerDialogOpen, setConfirmDeleteAnswerDialogOpen] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null); // Store the ID of the question to delete
  const [deleteAnswerId, setDeleteAnswerId] = useState(null); // Store the ID of the answer to delete
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  // const [loadingAnswers, setLoadingAnswers] = useState(false);

  // Fetch questions with filtering by level
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const data = await getQuestionsByTopic(topicId, token);
        // Filter questions by level
        const filteredQuestions = data.filter((question) => question.level === level);
        setQuestions(filteredQuestions);
      } catch (err) {
        setError('Failed to load questions');
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [topicId, token, level]);

  // Fetch answers for a specific question
  const handleFetchAnswers = async (questionId) => {
    // setLoadingAnswers(true);
    try {
      const data = await getAnswersByQuestion(questionId, token);
      setAnswers(data);
      setSelectedQuestionId(questionId); // Ensure answers are linked to the correct question
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

      if (isQuestionEditMode && questionFormData.id) {
        await updateQuestion(questionFormData.id, questionFormData, token);
        // Update the specific question in the list, keeping the position
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) =>
            question.id === questionFormData.id ? questionFormData : question
          )
        );
      } else {
        const newQuestion = await createQuestion(questionFormData, token);
        // Add the new question to the list
        setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
      }
      handleCloseQuestionDialog();
    } catch (err) {
      setError('Failed to save question');
    }
  };

  const handleAddOrUpdateAnswer = async () => {
    try {
      answerFormData.question = selectedQuestionId; // Assign question ID
      if (isAnswerEditMode && answerFormData.id) {
        await updateAnswer(answerFormData.id, answerFormData, token);
        // Update the specific answer in the list, keeping the position
        setAnswers((prevAnswers) =>
          prevAnswers.map((answer) => (answer.id === answerFormData.id ? answerFormData : answer))
        );
      } else {
        const newAnswer = await createAnswer(answerFormData, token);
        // Add the new answer to the list
        setAnswers((prevAnswers) => [...prevAnswers, newAnswer]);
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
      const filteredQuestions = updatedQuestions.filter((q) => q.level === level);
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

  if (loadingQuestions) {
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

  return (
    <Container>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          mb: 2,
        }}
      >
        {topicTitle}
      </Typography>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {level.charAt(0).toUpperCase() + level.slice(1)} Questions ({questions.length})
      </Typography>

      {questions.length === 0 && <Typography>No questions set.</Typography>}
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={4}>
        {questions.map((question) => (
          <Grid key={question.id} item xs={12} sm={6} md={4}>
            <Stack
              spacing={2}
              sx={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                height: '100%',
              }}
            >
              {isFormula(question.text) ? (
                <Typography variant="body2">
                  <TextWithFormulas text={question.text} />
                </Typography>
              ) : (
                <Typography>{question.text}</Typography>
              )}
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditQuestion(question);
                  }}
                >
                  <Iconify icon="eva:edit-outline" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuestion(question.id);
                  }}
                >
                  <Iconify icon="eva:trash-2-outline" />
                </IconButton>
                <Button
                  variant="outlined"
                  onClick={() => handleFetchAnswers(question.id)}
                  style={{ marginRight: '8px' }}
                >
                  View Options
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenAnswerDialog(question.id)}
                >
                  Add Option
                </Button>
              </Stack>
              {selectedQuestionId === question.id && (
                <Grid style={{ paddingLeft: '16px', paddingTop: '8px', marginBottom: '16px' }}>
                  {answers.length === 0 ? (
                    <Typography>No option added.</Typography>
                  ) : (
                    <Stack>
                      {answers.map((answer) => (
                        <Stack key={answer.id} direction="row" alignItems="center" spacing={1}>
                          {isFormula(answer.text) ? (
                            <Typography>
                              <TextWithFormulas text={answer.text} />
                            </Typography>
                          ) : (
                            <Typography>{answer.text}</Typography>
                          )}
                          {answer.isRight && (
                            <Checkbox
                              checked={answer.isRight}
                              name="isRight"
                              color="primary"
                              disabled
                            />
                          )}
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAnswer(answer);
                            }}
                          >
                            <Iconify icon="eva:edit-outline" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAnswer(answer.id);
                            }}
                          >
                            <Iconify icon="eva:trash-2-outline" />
                          </IconButton>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Grid>
              )}
            </Stack>
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
            type="number"
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
        <DialogContent>Are you sure you want to delete this question?</DialogContent>
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
        <DialogContent>Are you sure you want to delete this answer?</DialogContent>
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
