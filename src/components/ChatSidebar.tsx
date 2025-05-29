import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Box, Typography, CircularProgress, TextField, InputAdornment, IconButton, Divider, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { collection, query, where, onSnapshot, getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebase';
import { Search as SearchIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface ChatSidebarProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onSelectChat, selectedChatId }) => {
  const { user } = useAuthStore();
  const { searchUsers, startChat, deleteChat } = useChatStore();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCache, setUserCache] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const db = getFirestore(app);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, db]);

  // Кэшировать данные других пользователей для отображения имени/аватара
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      const ids = chats
        .map(chat => chat.participants.find((id: string) => id !== user.id))
        .filter(Boolean);
      const uniqueIds = Array.from(new Set(ids));
      const newCache: Record<string, any> = { ...userCache };
      for (const id of uniqueIds) {
        if (!newCache[id]) {
          const userDoc = await getDoc(doc(db, 'users', id));
          if (userDoc.exists()) {
            newCache[id] = userDoc.data();
          }
        }
      }
      setUserCache(newCache);
    };
    fetchUsers();
    // eslint-disable-next-line
  }, [chats]);

  if (!user) return null;
  const { id: userId } = user;

  // Поиск пользователей
  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setSearchLoading(true);
      try {
        const results = await searchUsers(searchTerm);
        // Исключить себя и тех, с кем уже есть чат
        const existingIds = chats.flatMap(chat => chat.participants);
        setSearchResults(results.filter((u: any) => u.id !== userId && !existingIds.includes(u.id)));
      } catch (e) {
        setSearchResults([]);
      }
      setSearchLoading(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleStartChat = async (otherUserId: string) => {
    await startChat(otherUserId);
    setSearchResults([]);
    setSearchTerm('');
  };

  // Удаление чата
  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete);
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  return (
    <Box sx={{ width: 300, borderRight: '1px solid #eee', height: '100vh', overflowY: 'auto', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ p: 2, pb: 1 }}>Чаты</Typography>
      {/* Поиск пользователей */}
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Поиск пользователей..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleSearch} size="small">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {searchLoading && <CircularProgress size={20} sx={{ mt: 1, ml: 1 }} />}
        {searchResults.length > 0 && (
          <List dense sx={{ mt: 1, mb: 1, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
            {searchResults.map(result => (
              <ListItem
                button
                key={result.id}
                onClick={() => handleStartChat(result.id)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemAvatar>
                  <Avatar src={result.photoURL}>{result.displayName?.[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={result.displayName}
                  secondary={`${result.university || ''} ${result.faculty || ''}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Divider />
      {/* Список чатов */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ flexGrow: 1 }}>
          {chats.map(chat => {
            const otherId = chat.participants.find((id: string) => id !== userId);
            const otherUser = userCache[otherId] || {};
            return (
              <ListItem
                button
                key={chat.id}
                selected={selectedChatId === chat.id}
                onClick={() => onSelectChat(chat.id)}
                sx={{
                  bgcolor: selectedChatId === chat.id ? 'action.selected' : undefined,
                  pr: 0
                }}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={e => { e.stopPropagation(); handleDeleteClick(chat.id); }}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar src={otherUser.photoURL}>{otherUser.displayName ? otherUser.displayName[0] : '?'}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={otherUser.displayName || otherId} />
              </ListItem>
            );
          })}
        </List>
      )}
      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Удалить чат?</DialogTitle>
        <DialogContent>
          <Typography>Вы действительно хотите удалить этот чат и все его сообщения? Это действие необратимо.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatSidebar; 