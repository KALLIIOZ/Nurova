import google.generativeai as genai
from core.config import get_settings

settings = get_settings()


class GeminiClient:
    """Gemini API client for chatbot"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def get_response(self, message: str, conversation_history: list = None) -> str:
        """Get response from Gemini"""
        try:
            if conversation_history is None:
                conversation_history = []
            
            # Build chat with history
            chat = self.model.start_chat(history=conversation_history)
            response = chat.send_message(message)
            
            return response.text
        except Exception as e:
            print(f"Error getting response from Gemini: {e}")
            return "Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo."
    
    async def get_response_with_system_prompt(self, message: str, system_prompt: str) -> str:
        """Get response with system prompt"""
        try:
            full_prompt = f"{system_prompt}\n\nUsuario: {message}"
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            print(f"Error getting response from Gemini: {e}")
            return "Lo siento, no pude procesar tu mensaje. Por favor intenta de nuevo."


class PsychologistSystemPrompt:
    """System prompt for psychologist chatbot"""
    
    PROMPT = """Eres un asistente psicológico empático y profesional. Tu rol es:
1. Escuchar activamente los problemas y preocupaciones del usuario
2. Proporcionar apoyo emocional y validación
3. Ofrecer perspectivas útiles basadas en principios de psicología
4. Sugerir técnicas de bienestar como meditación, respiración consciente
5. Mantener confidencialidad y privacidad
6. Reconocer cuando se necesita ayuda profesional urgente
7. Ser empático, sin ser condescendiente
8. Responder siempre en español

COVID IMPORTANTE: Si detectas signos de riesgo inmediato para la vida (suicidio, auto-daño), 
informa al usuario que debe contactar servicios de emergencia inmediatamente."""
