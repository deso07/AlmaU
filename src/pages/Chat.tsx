import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  Badge,
  Grid
} from '@mui/material';
import { Send as SendIcon, Search as SearchIcon, AttachFile as AttachFileIcon } from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import ChatSidebar from '../components/ChatSidebar';
import { uploadChatFile } from '../utils/storage';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebase';

const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const {
    searchUsers,
    startChat,
    sendMessage,
    messages,
    loading,
    error,
    cleanup
  } = useChatStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);
  
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      try {
        const results = await searchUsers(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching users:', error);
      }
    }
  };
  
  const handleStartChat = async (userId: string) => {
    try {
      const chatId = await startChat(userId);
      setSearchResults([]);
      setSearchTerm('');
      setSelectedChatId(chatId);

      // Fetch chat and set currentChat in store
      const db = getFirestore(app);
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (chatDoc.exists()) {
        const data = chatDoc.data();
        useChatStore.setState({
          currentChat: {
            id: chatId,
            participants: data.participants || [],
            unreadCount: data.unreadCount || 0,
            lastMessage: data.lastMessage || undefined
          }
        });
      }
      // Optionally, load messages for the new chat
      await useChatStore.getState().loadMessages(chatId);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
    if (!selectedChatId && !useChatStore.getState().currentChat?.id) {
      console.warn('No active chat selected');
      return;
    }
    if (messageText.trim()) {
      try {
        await sendMessage(messageText);
        setMessageText('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  // Выбор чата из сайдбара
  const handleSelectChat = async (chatId: string) => {
    setSelectedChatId(chatId);
    await useChatStore.getState().loadMessages(chatId);
    // Получить чат из Firestore и установить currentChat
    const db = getFirestore(app);
    const chatDoc = await getDoc(doc(db, 'chats', chatId));
    if (chatDoc.exists()) {
      const data = chatDoc.data();
      useChatStore.setState({
        currentChat: {
          id: chatId,
          participants: data.participants || [],
          unreadCount: data.unreadCount || 0,
          lastMessage: data.lastMessage || undefined
        }
      });
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const chatId = selectedChatId || useChatStore.getState().currentChat?.id;
    if (!file || !chatId) return;
    setUploading(true);
    try {
      const url = await uploadChatFile(file, chatId);
      await sendMessage('', url, file.type);
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={0} sx={{ p: 0, bgcolor: 'transparent' }}>
        <Grid container>
          <Grid item xs={12} md={4} lg={3}>
            <ChatSidebar onSelectChat={handleSelectChat} selectedChatId={selectedChatId} />
            <Paper elevation={3} sx={{ p: 2, mb: 2, mt: 2 }}>
        <TextField
                fullWidth
          variant="outlined"
                placeholder="Поиск пользователей..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch}>
                        <SearchIcon />
                      </IconButton>
              </InputAdornment>
            ),
          }}
        />
              {searchResults.length > 0 && (
                <List>
                  {searchResults.map((result) => (
              <ListItem 
                      key={result.id}
                button 
                      onClick={() => handleStartChat(result.id)}
                      sx={{ cursor: 'pointer' }}
              >
                <ListItemAvatar>
                        <Avatar src={result.photoURL} alt={result.displayName}>
                          {result.displayName?.[0]}
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                        primary={result.displayName}
                        secondary={`${result.university || ''} ${result.faculty || ''}`}
                      />
              </ListItem>
                  ))}
                </List>
        )}
    </Paper>
          </Grid>
          <Grid item xs={12} md={8} lg={9}>
    <Paper 
              elevation={3}
      sx={{ 
                height: '70vh',
        display: 'flex',
        flexDirection: 'column',
                p: 2,
                ml: { md: 2 },
                mt: { xs: 2, md: 0 }
              }}
            >
              <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error" align="center">
                    {error}
                  </Typography>
                ) : (
                  <List>
                    {messages.map((message) => (
                      <ListItem
                        key={message.id}
        sx={{ 
                          justifyContent: message.senderId === user?.id ? 'flex-end' : 'flex-start'
                        }}
                      >
      <Box 
        sx={{ 
                            maxWidth: '70%',
                            bgcolor: message.senderId === user?.id ? 'primary.main' : 'grey.100',
                            color: message.senderId === user?.id ? 'white' : 'text.primary',
                            borderRadius: 2,
                            p: 1
        }}
      >
                          {message.fileUrl && message.fileType?.startsWith('image/') && (
                            <img src={message.fileUrl} alt="img" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, marginBottom: 8 }} />
                          )}
                          {message.fileUrl && message.fileType?.startsWith('video/') && (
                            <video src={message.fileUrl} controls style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, marginBottom: 8 }} />
                          )}
                          {message.text && (
                            <Typography variant="body1">{message.text}</Typography>
                          )}
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {message.timestamp && message.timestamp.toDate ? new Date(message.timestamp.toDate()).toLocaleTimeString() : ''}
            </Typography>
          </Box>
                      </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                  </List>
                )}
              </Box>
              <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <IconButton onClick={() => fileInputRef.current?.click()} disabled={uploading} sx={{ mr: 1 }}>
          <AttachFileIcon />
        </IconButton>
        <TextField
                  fullWidth
                  variant="outlined"
          placeholder="Введите сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="submit" disabled={(!messageText.trim() && !fileInputRef.current?.files?.length) || uploading || !selectedChatId}>
          <SendIcon />
        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  disabled={uploading}
                />
      </Box>
    </Paper>
        </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Chat;
