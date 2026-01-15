import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity, Text } from 'react-native';
import api from '../services/api';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const listRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Cargar mensajes iniciales
  useEffect(() => {
    fetchMessages();
    // Poll every 5 seconds to get new messages (if any)
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/chat');
      setMessages(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (newMessage.trim() === '') return;
    const textToSend = newMessage;
    setNewMessage('');
    setIsTyping(true);

    try {
      const response = await api.post('/chat', { text: textToSend });
      // response.data contains { userMessage, botMessage }
      // We can just rely on fetching, or append manually for speed
      fetchMessages();
      setIsTyping(false);

      // Scroll to bottom
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error("Error sending message", error);
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={item.sender === 'me' ? styles.myMessageWrap : styles.otherMessageWrap}>
      <View style={item.sender === 'me' ? styles.myMessage : styles.otherMessage}>
        <Text style={item.sender === 'me' ? styles.myMessageText : styles.otherMessageText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat IA</Text>
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      {isTyping && (
        <View style={styles.typingWrap}>
          <View style={styles.typingBubble}>
            <Text style={styles.typingDots}>...</Text>
          </View>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF4FF',
  },
  header: {
    height: 68,
    backgroundColor: '#6F5FB3',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  messagesList: {
    flex: 1,
    padding: 18,
  },
  otherMessageWrap: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    width: '86%'
  },
  myMessageWrap: {
    alignSelf: 'flex-end',
    marginLeft: '14%',
    marginBottom: 12,
    width: '86%'
  },
  otherMessage: {
    backgroundColor: '#F1F4FF',
    padding: 14,
    borderRadius: 16,
  },
  myMessage: {
    backgroundColor: '#6F5FB3',
    padding: 14,
    borderRadius: 16,
  },
  otherMessageText: {
    color: '#20304E',
    fontSize: 14,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  typingWrap: {
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F4FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  typingDots: {
    color: '#20304E',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6F5FB3',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatScreen;