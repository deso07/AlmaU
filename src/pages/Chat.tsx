import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  InputAdornment,
  Badge,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as EmojiIcon,
  Image as ImageIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

// Типы данных для сообщений и чатов
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
  attachments?: string[];
}

interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  status?: 'online' | 'offline';
  lastActive?: string;
}

// Определение типа для chatPartner для корректной работы с status
type ChatPartner = User | { name: string; avatar: string };

// Пустые массивы вместо моковых данных
const mockUsers: User[] = [];
const generateMockChats = (currentUserId: string): Chat[] => [];

const ChatPage: React.FC = () => {
  const { user } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  
  useEffect(() => {
    if (user) {
      // Initialize with empty chats instead of mock data
      setChats([]);
    }
  }, [user]);
  
  useEffect(() => {
    scrollToBottom();
  }, [activeChat]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleOpenChat = (chat: Chat) => {
    setActiveChat(chat);
    if (isMobile) {
      setShowMobileChat(true);
    }
  };
  
  const handleBackToList = () => {
    setShowMobileChat(false);
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleSendMessage = () => {
    if (message.trim() && activeChat) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        senderId: user?.uid || '',
        text: message.trim(),
        timestamp: Date.now(),
        isRead: false
      };
      
      const updatedChat = {
        ...activeChat,
        messages: [...activeChat.messages, newMessage],
        lastMessage: newMessage
      };
      
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === activeChat.id ? updatedChat : chat
        )
      );
      
      setActiveChat(updatedChat);
      setMessage('');
      
      setTimeout(scrollToBottom, 100);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const filteredChats = chats.filter(chat => {
    const chatName = chat.isGroup 
      ? chat.groupName 
      : chat.participants.find(p => p.id !== user?.uid)?.name;
    
    return chatName?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatLastActive = (timestamp: number) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return formatMessageTime(timestamp);
    } else if (diffDays === 1) {
      return 'вчера';
    } else if (diffDays < 7) {
      const days = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];
      return `в ${days[messageDate.getDay()]}`;
    } else {
      return messageDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
    }
  };
  
  const ChatsList = (
    <Paper 
      elevation={0}
      sx={{ 
        height: '75vh',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        bgcolor: 'var(--surface)'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="h6" fontWeight="bold">
          Сообщения
        </Typography>
        <TextField
          placeholder="Поиск чатов..."
          variant="outlined"
          fullWidth
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <List sx={{ overflow: 'auto', flexGrow: 1, px: 1 }}>
        {filteredChats.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3 }}>
            <Typography color="textSecondary">
              У вас пока нет сообщений
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Начните общение с другими студентами или преподавателями
            </Typography>
          </Box>
        ) : (
          filteredChats.map(chat => {
            const chatPartner: ChatPartner = chat.isGroup 
              ? { name: chat.groupName || 'Групповой чат', avatar: chat.groupAvatar || '' }
              : chat.participants.find(p => p.id !== user?.uid) || { name: '', avatar: '' };
              
            // Check if chatPartner is a User type with status property
            const isUserWithStatus = 'id' in chatPartner && 'status' in chatPartner;
            const isOnline = isUserWithStatus && chatPartner.status === 'online';
              
            return (
              <ListItem 
                key={chat.id}
                button 
                onClick={() => handleOpenChat(chat)}
                sx={{ 
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <ListItemAvatar>
                  <Badge
                    color="success"
                    variant="dot"
                    invisible={!chat.isGroup && !isOnline}
                    overlap="circular"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                  >
                    <Avatar src={chat.isGroup ? chat.groupAvatar : chatPartner.avatar}>
                      {(chat.isGroup ? chat.groupName : chatPartner.name)?.charAt(0)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={chat.isGroup ? chat.groupName : chatPartner.name}
                  secondary={
                    chat.lastMessage 
                      ? chat.lastMessage.senderId === user?.uid
                        ? `Вы: ${chat.lastMessage.text}`
                        : chat.lastMessage.text
                      : 'Начните общение'
                  }
                  primaryTypographyProps={{
                    fontWeight: chat.lastMessage && !chat.lastMessage.isRead && chat.lastMessage.senderId !== user?.uid ? 'bold' : 'normal'
                  }}
                  secondaryTypographyProps={{
                    noWrap: true,
                    fontWeight: chat.lastMessage && !chat.lastMessage.isRead && chat.lastMessage.senderId !== user?.uid ? 'bold' : 'normal'
                  }}
                />
                {chat.lastMessage && (
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 1, minWidth: 40, textAlign: 'right' }}>
                    {formatLastActive(chat.lastMessage.timestamp)}
                  </Typography>
                )}
              </ListItem>
            );
          })
        )}
      </List>
    </Paper>
  );
  
  const ChatContent = activeChat ? (
    <Paper 
      elevation={0}
      sx={{ 
        height: '75vh',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        bgcolor: 'var(--surface)'
      }}
    >
      {/* Заголовок чата */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)' 
        }}
      >
        {isMobile && (
          <IconButton edge="start" onClick={handleBackToList} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Avatar 
          src={
            activeChat.isGroup 
              ? activeChat.groupAvatar 
              : activeChat.participants.find(p => p.id !== user?.uid)?.avatar
          }
          sx={{ mr: 2 }}
        >
          {(activeChat.isGroup 
            ? activeChat.groupName 
            : activeChat.participants.find(p => p.id !== user?.uid)?.name)?.charAt(0)}
        </Avatar>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {activeChat.isGroup 
              ? activeChat.groupName 
              : activeChat.participants.find(p => p.id !== user?.uid)?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {activeChat.isGroup 
              ? `${activeChat.participants.length} участников` 
              : activeChat.participants.find(p => p.id !== user?.uid)?.status === 'online'
                ? 'В сети'
                : activeChat.participants.find(p => p.id !== user?.uid)?.lastActive || 'Не в сети'}
          </Typography>
        </Box>
        
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      {/* Область сообщений */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {activeChat.messages.length === 0 ? (
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Typography color="textSecondary" align="center">
              Начало диалога
            </Typography>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
              Отправьте сообщение, чтобы начать общение
            </Typography>
          </Box>
        ) : (
          activeChat.messages.map(msg => {
            const isCurrentUser = msg.senderId === user?.uid;
            const sender = activeChat.participants.find(p => p.id === msg.senderId);
            
            return (
              <Box 
                key={msg.id}
                sx={{ 
                  display: 'flex',
                  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                  mb: 1.5
                }}
              >
                {!isCurrentUser && activeChat.isGroup && (
                  <Avatar 
                    src={sender?.avatar} 
                    sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }}
                  >
                    {sender?.name.charAt(0)}
                  </Avatar>
                )}
                
                <Box sx={{ maxWidth: '70%' }}>
                  {!isCurrentUser && activeChat.isGroup && (
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                      {sender?.name}
                    </Typography>
                  )}
                  
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 1.5,
                      bgcolor: isCurrentUser ? 'primary.main' : 'background.paper',
                      color: isCurrentUser ? 'white' : 'text.primary',
                      borderRadius: 2,
                      ml: isCurrentUser ? 0 : 1,
                      border: !isCurrentUser ? '1px solid rgba(0,0,0,0.08)' : 'none'
                    }}
                  >
                    <Typography variant="body1">
                      {msg.text}
                    </Typography>
                  </Paper>
                  
                  <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                    {formatMessageTime(msg.timestamp)}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Область ввода */}
      <Box 
        sx={{ 
          p: 2,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <IconButton>
          <AttachFileIcon />
        </IconButton>
        <IconButton>
          <ImageIcon />
        </IconButton>
        <IconButton>
          <EmojiIcon />
        </IconButton>
        
        <TextField
          placeholder="Введите сообщение..."
          variant="outlined"
          fullWidth
          multiline
          maxRows={4}
          size="small"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        
        <IconButton 
          sx={{ ml: 1 }} 
          color="primary"
          onClick={handleSendMessage}
          disabled={message.trim() === ''}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  ) : (
    <Paper 
      elevation={0}
      sx={{ 
        height: '75vh',
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        p: 3,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        bgcolor: 'var(--surface)'
      }}
    >
      <Typography variant="h6" color="textSecondary" gutterBottom>
        Выберите чат для общения
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center">
        Здесь появятся сообщения. Начните общение с друзьями или преподавателями.
      </Typography>
    </Paper>
  );
  
  if (isMobile) {
    return (
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
          Чаты
        </Typography>
        
        {!showMobileChat ? ChatsList : ChatContent}
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Чаты
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {ChatsList}
        </Grid>
        <Grid item xs={12} md={8}>
          {ChatContent}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatPage;
