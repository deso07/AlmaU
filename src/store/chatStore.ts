import { create } from 'zustand';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
  doc,
  updateDoc,
  Unsubscribe,
  startAt,
  endAt,
  deleteDoc
} from 'firebase/firestore';
import { app } from '../config/firebase';
import { useAuthStore } from './authStore';

const db = getFirestore(app);

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: any;
  read: boolean;
  fileUrl?: string | null;
  fileType?: string | null;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  unsubscribe: Unsubscribe | null;
  searchUsers: (searchTerm: string) => Promise<any[]>;
  startChat: (userId: string) => Promise<string>;
  sendMessage: (text: string, fileUrl?: string, fileType?: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  cleanup: () => void;
  deleteChat: (chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
  unsubscribe: null,

  searchUsers: async (searchTerm: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('displayName'),
        startAt(searchTerm),
        endAt(searchTerm + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  startChat: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('Not authenticated');
      const chatsRef = collection(db, 'chats');
      const participants = [user.id, userId].sort();
      const q = query(
        chatsRef,
        where('participants', '==', participants)
      );
      const querySnapshot = await getDocs(q);
      let chatId: string;
      let chatData: any;
      if (querySnapshot.empty) {
        const newChat = {
          participants,
          unreadCount: 0,
          createdAt: serverTimestamp()
        };
        const docRef = await addDoc(chatsRef, newChat);
        chatId = docRef.id;
        chatData = newChat;
      } else {
        chatId = querySnapshot.docs[0].id;
        chatData = querySnapshot.docs[0].data();
      }
      set({ currentChat: { id: chatId, ...chatData } });
      await get().loadMessages(chatId);
      set({ loading: false });
      return chatId;
    } catch (error) {
      set({ loading: false, error: 'Error starting chat' });
      console.error('Error starting chat:', error);
      throw error;
    }
  },

  sendMessage: async (text: string, fileUrl?: string, fileType?: string) => {
    try {
      const { currentChat } = get();
      const { user } = useAuthStore.getState();
      if (!currentChat || !user) throw new Error('No active chat');
      const messagesRef = collection(db, 'messages');
      const otherId = currentChat.participants.find(id => id !== user.id);
      const newMessage = {
        chatId: currentChat.id,
        senderId: user.id,
        receiverId: otherId,
        text,
        timestamp: serverTimestamp(),
        read: false,
        fileUrl: fileUrl || null,
        fileType: fileType || null
      };
      await addDoc(messagesRef, newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  loadMessages: async (chatId: string) => {
    try {
      set({ loading: true, error: null });
      const { unsubscribe: prevUnsubscribe } = get();
      if (prevUnsubscribe) {
        prevUnsubscribe();
      }
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('chatId', '==', chatId),
        orderBy('timestamp', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        set({ messages, loading: false });
      });
      set({ unsubscribe });
    } catch (error) {
      set({ loading: false, error: 'Error loading messages' });
      console.error('Error loading messages:', error);
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { read: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null, messages: [] });
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      set({ loading: true, error: null });
      const db = getFirestore(app);
      // Удалить все сообщения этого чата
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('chatId', '==', chatId));
      const snapshot = await getDocs(q);
      const batchDeletes = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'messages', docSnap.id)));
      await Promise.all(batchDeletes);
      // Удалить сам чат
      await deleteDoc(doc(db, 'chats', chatId));
      set({ loading: false, currentChat: null, messages: [] });
    } catch (error) {
      set({ loading: false, error: 'Ошибка при удалении чата' });
      console.error('Ошибка при удалении чата:', error);
    }
  }
})); 