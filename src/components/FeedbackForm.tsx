import React, { useState } from 'react';

interface FeedbackFormProps {
  courseId: string;
  teacherId: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ courseId, teacherId }) => {
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Отправка данных на сервер
    console.log({ feedback, email, courseId, teacherId });
    setSubmitted(true);
  };

  return (
    <div>
      <h2>Feedback for Course: {courseId}</h2>
      <h3>Teacher: {teacherId}</h3>
      {submitted ? (
        <h3>Спасибо за ваш отзыв!</h3>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Оставьте отзыв</h2>
          <textarea
            placeholder="Ваш отзыв"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Отправить</button>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;