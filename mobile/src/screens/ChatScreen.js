import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TextInput, TouchableOpacity, Text } from 'react-native';
import api from '../services/api';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const listRef = React.useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Cargar mensajes iniciales
  useEffect(() => {
<<<<<<< HEAD:mobile/src/screens/ChatScreen.js
    fetchMessages();
    // Optional: poll every X seconds
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

    try {
      const response = await api.post('/chat', { text: newMessage });
      // response.data contains { userMessage, botMessage }
      const { userMessage, botMessage } = response.data;

      setMessages(prevMessages => [
        ...prevMessages,
        userMessage,
        botMessage
      ]);
      setNewMessage('');
      // Refresh full list to be safe of ordering
      fetchMessages();
    } catch (error) {
      console.error("Error sending message", error);
    }
=======
    setMessages([
      { id: '1', text: '¡Hola Valeria! ¿Estás pasando por alguna situación dentro de tu empresa?', sender: 'other' },
      { id: '2', text: 'Últimamente me cuesta concentrarme en el trabajo... me siento abrumada, como si tuviera mil cosas encima y ninguna energía.', sender: 'me' },
      { id: '3', text: 'Lamento que te sientas así. ¿Te ha pasado esto en otras etapas de tu vida o es algo reciente? Estoy aquí para acompañarte y ayudarte a entender qué puede estar afectándote.', sender: 'other'},
      { id: '4', text: 'Creo que empezó hace un par de meses, pero se ha intensificado últimamente. A veces me cuesta hasta salir de la cama.', sender: 'me'},
      { id: '5', text: 'Gracias por compartirlo. Tu bienestar es importante. Notar falta de energía y dificultad para concentrarte podría ser señal de que necesitas una pausa o más apoyo emocional. ¿Has notado cambios en tu sueño, apetito o estado de ánimo?', sender: 'other'},
    ]);
  }, []);

  const handleSend = () => {
    const content = newMessage.trim();
    if (content === '') return;

    // append user message
    const messageId = Date.now().toString();
    setMessages(prevMessages => [
      ...prevMessages,
      { id: messageId, text: content, sender: 'me' },
    ]);

    setNewMessage('');

    // simulate AI typing and reply
    setIsTyping(true);
    const delay = 900 + Math.floor(Math.random() * 900);
    setTimeout(() => {
      const replyText = generateReply(content);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: replyText, sender: 'other' },
      ]);
      setIsTyping(false);
      // scroll to bottom
      listRef.current?.scrollToEnd({ animated: true });
    }, delay);
>>>>>>> 49a72a044e99258f65e9490e898d1d55c47f9826:src/screens/ChatScreen.js
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

// Generate a simple simulated reply based on keywords or fallback
function generateReply(text) {
  const t = text.toLowerCase();

  if (t.includes('triste') || t.includes('deprim') || t.includes('abrum')) {
    return 'Siento que te sientas así — gracias por compartirlo. Cuando te sientes así suele ayudar hablar con alguien de confianza y cuidar sueño y alimentación. ¿Hay algo que haya cambiado en tus rutinas recientes?';
  }

  if (t.includes('estres') || t.includes('ansied') || t.includes('stress')) {
    return 'Lo que describes suena a estrés. Algunas pequeñas pausas y ejercicios de respiración pueden ayudar momentáneamente. ¿Quieres que te sugiera una breve respiración guiada ahora?';
  }

  if (t.includes('trabajo') || t.includes('empleo') || t.includes('jefe')) {
    return 'El trabajo puede afectar mucho nuestro bienestar. ¿Te gustaría contar más sobre la situación en el trabajo o prefieres ideas para manejar la carga por ahora?';
  }

  // fallback gentle reply
  const fallbacks = [
    'Gracias por compartir — estoy aquí para escucharte. ¿Te gustaría profundizar un poco más en eso?',
    'Entiendo. ¿Quieres explorar formas prácticas para mejorar esto paso a paso?',
    'Gracias. A veces escribir más sobre lo que sientes ayuda a ordenar los pensamientos. ¿Quieres intentarlo?'
  ];

  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

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