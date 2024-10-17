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
import CircularProgress from '@mui/material/CircularProgress'; // Import MathJax for rendering formulas

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

const formatDuration = (duration) => {
  const parts = duration.split(':');
  return parts.length > 0 ? parts[parts.length - 1] : duration; // Return seconds part
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
  // const [answers, setAnswers] = useState([]);
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
  // Fetch questions with filtering by level
  useEffect(() => {
    const fetchQuestionsAndAnswers = async () => {
      setLoadingQuestions(true);
      try {
        const questionsData = await getQuestionsByTopic(topicId, token);
        const filteredQuestions = questionsData.filter((question) => question.level === level);

        // Fetch answers for each question
        const questionsWithAnswers = await Promise.all(
          filteredQuestions.map(async (question) => {
            const fetchedAnswers = await getAnswersByQuestion(question.id, token);
            return { ...question, fetchedAnswers }; // Attach answers to the question
          })
        );
        console.log(JSON.stringify(questionsWithAnswers, null, 2));
        setQuestions(questionsWithAnswers);
      } catch (err) {
        setError('Failed to load questions and answers');
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestionsAndAnswers();
  }, [topicId, token, level]);

  const handleOpenQuestionDialog = () => {
    setOpenQuestionDialog(true);
    setError(null);
  };
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typeset();
    }
  }, [token, topicId, level]);

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
      let updatedQuestion;
      if (isQuestionEditMode && questionFormData.id) {
        await updateQuestion(questionFormData.id, questionFormData, token);
        updatedQuestion = questionFormData;
      } else {
        const createdQuestion = await createQuestion(questionFormData, token);
        updatedQuestion = createdQuestion;
      }

      setQuestions((prevQuestions) => {
        if (isQuestionEditMode) {
          // Update the specific question
          return prevQuestions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q));
        }
        // Add the new question
        return [...prevQuestions, updatedQuestion];
      });

      handleCloseQuestionDialog();
    } catch (err) {
      setError('Failed to save question');
    }
  };

  const handleAddOrUpdateAnswer = async () => {
    try {
      answerFormData.question = selectedQuestionId; // Assign question ID
      let updatedAnswer;
      if (isAnswerEditMode && answerFormData.id) {
        await updateAnswer(answerFormData.id, answerFormData, token); // Use the correct answer ID
        updatedAnswer = answerFormData;
      } else {
        const createdAnswer = await createAnswer(answerFormData, token);
        updatedAnswer = createdAnswer;
      }

      // Update the answers for the corresponding question in the local state
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question.id === selectedQuestionId
            ? {
                ...question,
                fetchedAnswers: isAnswerEditMode
                  ? question.fetchedAnswers.map((answer) =>
                      answer.id === updatedAnswer.id ? updatedAnswer : answer
                    )
                  : [...question.fetchedAnswers, updatedAnswer],
              }
            : question
        )
      );

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
      setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== deleteQuestionId));
      setConfirmDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete question');
    }
  };

  const handleConfirmDeleteAnswer = async () => {
    try {
      await deleteAnswer(deleteAnswerId, token);
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question.id === selectedQuestionId
            ? {
                ...question,
                fetchedAnswers: question.fetchedAnswers.filter(
                  (answer) => answer.id !== deleteAnswerId
                ),
              }
            : question
        )
      );
      setConfirmDeleteAnswerDialogOpen(false);
    } catch (err) {
      setError('Failed to delete answer');
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
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {topicTitle} - {level}
      </Typography>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {questions.length} Questions
      </Typography>
      {questions.length === 0 && (
        <Alert severity="info" sx={{ textAlign: 'center', fontSize: '1rem' }}>
          No Questions found. Add one by clicking the Add Question button below.
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenQuestionDialog}
        sx={{ marginBottom: 3 }}
      >
        Add Question
      </Button>

      <Grid container spacing={4}>
        {questions.map((question) => (
          <Grid item xs={12} sm={6} md={4} key={question.id}>
            <Stack
              spacing={2}
              sx={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                height: '100%',
              }}
              // onClick={() => handleFetchAnswers(question.id)} // Fetch answers when a question is clicked
            >
              {isFormula(question.text) ? (
                <Typography variant="body2">
                  <TextWithFormulas text={question.text} />
                </Typography>
              ) : (
                <Typography>{question.text}</Typography>
              )}
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                Duration: {formatDuration(question.duration)} seconds
              </Typography>
              <Stack direction="row" spacing={1}>
                {/* <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent click event
                    handleFetchAnswers(question.id);
                  }}
                >
                  View Answers
                </Button> */}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent click event
                    handleOpenAnswerDialog(question.id);
                  }}
                >
                  Add Option
                </Button>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent click event
                    handleEditQuestion(question);
                  }}
                >
                  <Iconify icon="eva:edit-outline" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the parent click event
                    handleDeleteQuestion(question.id);
                  }}
                >
                  <Iconify icon="eva:trash-2-outline" />
                </IconButton>
              </Stack>
              {/* Render answers for the selected question */}
              {/* {selectedQuestionId === question.id && (
                <> */}
              {question.fetchedAnswers.length === 0 ? (
                <Typography>No answers added.</Typography>
              ) : (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Options:
                  </Typography>
                  {question.fetchedAnswers.map((answer) => (
                    <Stack key={answer.id} direction="row" alignItems="center" spacing={1}>
                      {isFormula(answer.text) ? (
                        <Typography>
                          <TextWithFormulas text={answer.text} />
                        </Typography>
                      ) : (
                        <Typography>{answer.text}</Typography>
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
                </>
              )}
              {/* </> */}
              {/* )} */}
            </Stack>
          </Grid>
        ))}
      </Grid>

      {/* Dialog for adding or editing a question */}
      <Dialog open={openQuestionDialog} onClose={handleCloseQuestionDialog}>
        <DialogTitle>{isQuestionEditMode ? 'Edit Question' : 'Add Question'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="text"
            label="Question"
            type="text"
            fullWidth
            variant="outlined"
            value={questionFormData.text}
            onChange={handleQuestionInputChange}
            inputProps={{ spellCheck: 'true' }}
          />
          <TextField
            margin="dense"
            name="duration"
            label="Duration (seconds)"
            type="number"
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

      {/* Dialog for adding or editing an answer */}
      <Dialog open={openAnswerDialog} onClose={handleCloseAnswerDialog}>
        <DialogTitle>{isAnswerEditMode ? 'Edit Answer' : 'Add Answer'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="text"
            label="Answer"
            type="text"
            fullWidth
            variant="outlined"
            value={answerFormData.text}
            onChange={handleAnswerInputChange}
            inputProps={{ spellCheck: 'true' }}
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

      {/* Confirmation Dialog for Deleting Question */}
      <Dialog open={confirmDeleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete Question</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this question?</Typography>
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

      {/* Confirmation Dialog for Deleting Answer */}
      <Dialog open={confirmDeleteAnswerDialogOpen} onClose={handleCancelDeleteAnswer}>
        <DialogTitle>Confirm Delete Answer</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this answer?</Typography>
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
