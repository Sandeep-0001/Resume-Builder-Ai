import React, { useState } from 'react';
import { AIChatSession } from '../../Services/AiModel';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageSquare, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useSelector((state) => state.editUser.userData);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const result = await AIChatSession.sendMessage(input);
      let botResponse = result.response.text();

      try {
        const parsedResponse = JSON.parse(botResponse);
        if (parsedResponse.message) {
          botResponse = parsedResponse.message;
        } else if (parsedResponse.tips_to_improve_resume) {
          let formattedTips = "Here are some tips to improve your resume:\n\n";
          parsedResponse.tips_to_improve_resume.forEach(category => {
            formattedTips += `**${category.category}:**\n`;
            category.advice.forEach(tip => {
              formattedTips += `- ${tip}\n`;
            });
            formattedTips += "\n";
          });
          botResponse = formattedTips;
        } else if (parsedResponse.title && parsedResponse.advice) {
          let formattedAdvice = `**${parsedResponse.title}**\n\n`;
          parsedResponse.advice.forEach(category => {
            formattedAdvice += `**${category.category}**\n`;
            category.points.forEach(point => {
              formattedAdvice += `- ${point}\n`;
            });
            formattedAdvice += "\n";
          });
          if (parsedResponse.note) {
            formattedAdvice += `*Note: ${parsedResponse.note}*\n`;
          }
          botResponse = formattedAdvice;
        }
      } catch (jsonError) {
        // Not a JSON response, use as is
      }

      setMessages([...newMessages, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setMessages([...newMessages, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Don't render chatbot if user is not signed in
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-green-400 to-purple-500 text-white rounded-t-lg">
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-white hover:text-green-400">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
              {messages.length === 0 && (
                <p className="text-center text-gray-500">Ask me anything about resumes!</p>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded-lg ${msg.sender === 'user' ? 'bg-green-100 text-right ml-auto' : 'bg-gray-100 text-left mr-auto'}`}
                  style={{ maxWidth: '80%' }}
                >
                  {msg.text}
                </div>
              ))}
              {loading && <p className="text-center text-gray-500">Typing...</p>}
            </div>
            <div className="p-4 border-t flex">
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 mr-2"
              />
              <Button onClick={handleSendMessage} disabled={loading}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isOpen && (
        <Button
          className="rounded-full w-14 h-14 bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-7 w-7 text-white" />
        </Button>
      )}
    </div>
  );
};

export default ChatBot;
