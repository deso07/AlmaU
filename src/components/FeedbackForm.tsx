import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../config/firebase';

interface FeedbackFormProps {
  courseId: string;
  teacherId: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ courseId, teacherId }) => {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const db = getFirestore(app);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      setError('Введите корректный email');
      return;
    }
    try {
      await addDoc(collection(db, 'feedback'), {
        courseId,
        teacherId,
        email,
        comment: feedback,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setFeedback('');
      setEmail('');
    } catch (e) {
      setError('Ошибка при отправке. Попробуйте позже.');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Обратная связь по курсу: <b>{courseId}</b>
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Преподаватель: <b>{teacherId}</b>
      </Typography>
      {submitted ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Спасибо за ваш отзыв!
        </Alert>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Ваш отзыв"
            multiline
            minRows={3}
            fullWidth
            required
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Ваш email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Button type="submit" variant="contained">
            Отправить
          </Button>
        </form>
      )}
    </Box>
  );
};

export default FeedbackForm;