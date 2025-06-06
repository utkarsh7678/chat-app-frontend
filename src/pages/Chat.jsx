import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import useStore from '../store/useStore';

const Chat = () => {
  const { userId } = useParams();
  const { setActiveChat } = useStore();

  useEffect(() => {
    if (userId) {
      setActiveChat(userId);
    }
  }, [userId, setActiveChat]);

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
      }}
    >
      <ChatList />
      <ChatWindow />
    </Box>
  );
};

export default Chat; 