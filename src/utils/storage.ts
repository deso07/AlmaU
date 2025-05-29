import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../config/firebase';

const storage = getStorage(app);

export const uploadAvatar = async (file: File, userId: string): Promise<string> => {
  try {
    // Создаем reference для файла
    const avatarRef = ref(storage, `avatars/${userId}/${file.name}`);
    
    // Загружаем файл
    await uploadBytes(avatarRef, file);
    
    // Получаем URL загруженного файла
    const downloadURL = await getDownloadURL(avatarRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export const uploadChatFile = async (file: File, chatId: string): Promise<string> => {
  const ext = file.name.split('.').pop();
  const fileRef = ref(storage, `chat_files/${chatId}/${Date.now()}.${ext}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}; 