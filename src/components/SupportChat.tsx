import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Paper, TextField, Typography, CircularProgress, Alert, useMediaQuery } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';

interface Message {
  role: 'user' | 'assistant';
  content: { type: 'text'; text: string }[] | string;
}

// Функция для рендера текста с Markdown-ссылками и обычными ссылками
function renderWithLinks(text: string) {
  const mdLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = mdLinkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match[2] + match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#1976d2', wordBreak: 'break-all' }}
      >
        {match[1]}
      </a>
    );
    lastIndex = mdLinkRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.flatMap((part, idx) =>
    typeof part === 'string'
      ? part.split(urlRegex).map((sub, j) =>
          urlRegex.test(sub) ? (
            <a
              key={sub + idx + '-' + j}
              href={sub}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1976d2', wordBreak: 'break-all' }}
            >
              {sub}
            </a>
          ) : (
            sub
          )
        )
      : part
  );
}

const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setError(null);

    const userMessage: Message = {
      role: 'user',
      content: [{ type: 'text', text: input.trim() }]
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!apiKey) throw new Error('OpenRouter API key is not set!');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'StudentHub'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: [
                { type: 'text', text: `
Ты — идеальный чат-бот поддержки платформы StudentHub. Вот твои правила:
- Отвечай только по возможностям, функциям и правилам StudentHub.
- Если вопрос не по сайту — вежливо откажи: «Я могу помочь только по вопросам, связанным с платформой StudentHub».
- Если можешь — давай прямые ссылки на нужные разделы сайта.
- Будь дружелюбным, но пиши кратко и по делу. Если пользователь не понял — предложи объяснить подробнее.
- Вот основные разделы сайта и их ссылки:
  • Главная: https://sthub2-da44f.web.app/
  • Задачи: https://sthub2-da44f.web.app/tasks
  • Материалы: https://sthub2-da44f.web.app/materials
  • Расписание: https://sthub2-da44f.web.app/schedule
  • Карта кампуса: https://sthub2-da44f.web.app/campus-map
  • Вакансии: https://sthub2-da44f.web.app/jobs
  • События: https://sthub2-da44f.web.app/events
  • Чат: https://sthub2-da44f.web.app/chat
  • Оценки: https://sthub2-da44f.web.app/grades
  • Профиль преподавателя: https://sthub2-da44f.web.app/teacher-profile
  • Дополнительные курсы: https://sthub2-da44f.web.app/additional-courses
  • FAQ: https://sthub2-da44f.web.app/faq
  • Настройки: https://sthub2-da44f.web.app/settings

- Вот примеры часто задаваемых вопросов и ответов:
  • Как добавить задачу? — Перейдите в раздел «Задачи» (https://sthub2-da44f.web.app/tasks) и нажмите «Добавить задачу».
  • Как посмотреть свои оценки? — Откройте раздел «Оценки» (https://sthub2-da44f.web.app/grades).
  • Как записаться на дополнительный курс? — Перейдите в «Дополнительные курсы» (https://sthub2-da44f.web.app/additional-courses) и выберите интересующий курс.
  • Как связаться с поддержкой? — Используйте этот чат или перейдите в раздел «FAQ» (https://sthub2-da44f.web.app/faq).
  • Как загрузить учебный материал? — В разделе «Материалы» (https://sthub2-da44f.web.app/materials) нажмите «Загрузить материал» и следуйте инструкциям.
  • Как восстановить пароль? — На странице входа нажмите «Забыли пароль?» и следуйте подсказкам.
  • Как изменить профиль? — В разделе «Настройки» (https://sthub2-da44f.web.app/settings) вы можете изменить свои данные и настройки безопасности.
  • Как найти расписание занятий? — Перейдите в раздел «Расписание» (https://sthub2-da44f.web.app/schedule).
  • Как посмотреть карту кампуса? — Откройте раздел «Карта кампуса» (https://sthub2-da44f.web.app/campus-map).
  • Как найти вакансию или стажировку? — Перейдите в раздел «Вакансии» (https://sthub2-da44f.web.app/jobs).
  • Как участвовать в мероприятиях? — Смотрите раздел «События» (https://sthub2-da44f.web.app/events).

Если вопрос касается этих разделов — помоги максимально подробно, ссылайся на нужные страницы. Если вопрос не по сайту — вежливо откажи или предложи обратиться в поддержку.` }
              ]
            },
            ...messages,
            userMessage
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }
      const data = await response.json();
      const content = data.choices[0].message.content;
      const assistantMessage: Message = {
        role: 'assistant',
        content: Array.isArray(content)
          ? content
          : [{ type: 'text', text: String(content) }]
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: [{ type: 'text', text: 'Sorry, I encountered an error. Please try again later.' }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: isMobile ? 16 : 20,
          right: isMobile ? 16 : 20,
          backgroundColor: 'primary.main',
          color: 'white',
          width: isMobile ? 60 : 48,
          height: isMobile ? 60 : 48,
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          zIndex: 1300,
          boxShadow: 3,
        }}
      >
        {isOpen ? <CloseIcon sx={{ fontSize: isMobile ? 32 : 24 }} /> : <ChatIcon sx={{ fontSize: isMobile ? 32 : 24 }} />}
      </IconButton>

      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: isMobile ? '100vw' : 350,
            height: isMobile ? '100vh' : 500,
            maxWidth: '100vw',
            maxHeight: '100vh',
            borderRadius: isMobile ? 0 : 3,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1300,
          }}
        >
          <Box sx={{
            p: isMobile ? 2 : 2,
            borderBottom: 1,
            borderColor: 'divider',
            textAlign: 'center',
            position: 'relative',
          }}>
            <Typography variant={isMobile ? 'h6' : 'h6'} sx={{ fontWeight: 600, fontSize: isMobile ? 22 : 20 }}>
              Support Chat
            </Typography>
            <IconButton
              onClick={() => setIsOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: 'grey.500',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: isMobile ? 1.5 : 2,
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? 1.2 : 1,
              bgcolor: isMobile ? '#181c23' : 'inherit',
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  width: 'auto',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: isMobile ? 1.2 : 1,
                    px: isMobile ? 2 : 1.5,
                    fontSize: isMobile ? 17 : 15,
                    backgroundColor: message.role === 'user' ? 'primary.light' : (isMobile ? '#232a36' : 'grey.100'),
                    color: message.role === 'user' ? '#fff' : (isMobile ? '#fff' : 'inherit'),
                    borderRadius: 3,
                  }}
                >
                  {Array.isArray(message.content)
                    ? message.content.map((c, i) => (
                        <Typography key={i} variant="body1" component="span" sx={{ fontSize: isMobile ? 17 : 15 }}>
                          {renderWithLinks(c.text)}
                        </Typography>
                      ))
                    : <Typography variant="body1" component="span" sx={{ fontSize: isMobile ? 17 : 15 }}>{renderWithLinks(String(message.content))}</Typography>
                  }
                </Paper>
              </Box>
            ))}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                <CircularProgress size={isMobile ? 28 : 20} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{
            p: isMobile ? 1.2 : 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: isMobile ? '#181c23' : 'inherit',
          }}>
            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size={isMobile ? 'medium' : 'small'}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                sx={{
                  bgcolor: isMobile ? '#232a36' : 'inherit',
                  input: { color: isMobile ? '#fff' : 'inherit', fontSize: isMobile ? 17 : 15 },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                sx={{
                  width: isMobile ? 48 : 40,
                  height: isMobile ? 48 : 40,
                  fontSize: isMobile ? 28 : 22,
                }}
              >
                <SendIcon sx={{ fontSize: isMobile ? 28 : 22 }} />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default SupportChat; 