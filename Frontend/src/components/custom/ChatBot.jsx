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

  const formatJsonResponse = (jsonData) => {
    // Handle different JSON response structures
    if (typeof jsonData === 'string') {
      return jsonData;
    }

    if (jsonData.message) {
      return jsonData.message;
    }

    if (jsonData.response) {
      return jsonData.response;
    }

    if (jsonData.answer) {
      return jsonData.answer;
    }

    if (jsonData.content) {
      return jsonData.content;
    }

    if (jsonData.text) {
      return jsonData.text;
    }

    // Handle structured advice/tips
    if (jsonData.tips_to_improve_resume) {
      let formattedTips = "Here are some tips to improve your resume:\n\n";
      if (Array.isArray(jsonData.tips_to_improve_resume)) {
        jsonData.tips_to_improve_resume.forEach(category => {
          formattedTips += `**${category.category}:**\n`;
          if (category.advice && Array.isArray(category.advice)) {
            category.advice.forEach(tip => {
              formattedTips += `- ${tip}\n`;
            });
          }
          formattedTips += "\n";
        });
      }
      return formattedTips;
    }

    if (jsonData.title && jsonData.advice) {
      let formattedAdvice = `**${jsonData.title}**\n\n`;
      if (Array.isArray(jsonData.advice)) {
        jsonData.advice.forEach(category => {
          formattedAdvice += `**${category.category}**\n`;
          if (category.points && Array.isArray(category.points)) {
            category.points.forEach(point => {
              formattedAdvice += `- ${point}\n`;
            });
          }
          formattedAdvice += "\n";
        });
      }
      if (jsonData.note) {
        formattedAdvice += `*Note: ${jsonData.note}*\n`;
      }
      return formattedAdvice;
    }

    // Handle array of tips/advice
    if (Array.isArray(jsonData)) {
      let formattedList = "";
      jsonData.forEach((item, index) => {
        if (typeof item === 'string') {
          formattedList += `${index + 1}. ${item}\n`;
        } else if (item.text || item.message || item.advice) {
          formattedList += `${index + 1}. ${item.text || item.message || item.advice}\n`;
        }
      });
      return formattedList || "Here's some advice for you:\n" + jsonData.join('\n');
    }

    // Handle object with multiple properties
    if (typeof jsonData === 'object') {
      let formattedText = "";
      Object.keys(jsonData).forEach(key => {
        if (typeof jsonData[key] === 'string' && jsonData[key].length > 0) {
          formattedText += `**${key.charAt(0).toUpperCase() + key.slice(1)}:** ${jsonData[key]}\n\n`;
        } else if (Array.isArray(jsonData[key]) && jsonData[key].length > 0) {
          formattedText += `**${key.charAt(0).toUpperCase() + key.slice(1)}:**\n`;
          jsonData[key].forEach((item, index) => {
            formattedText += `${index + 1}. ${item}\n`;
          });
          formattedText += "\n";
        }
      });
      return formattedText || JSON.stringify(jsonData, null, 2);
    }

    // Fallback: return stringified JSON
    return JSON.stringify(jsonData, null, 2);
  };

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
        botResponse = formatJsonResponse(parsedResponse);
      } catch (jsonError) {
        // Not a JSON response, use as is
        console.log('Response is not JSON, using as plain text');
      }

      setMessages([...newMessages, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      setMessages([...newMessages, { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
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
                  <div className="whitespace-pre-wrap">
                    {msg.text.split('\n').map((line, lineIndex) => {
                      // Handle markdown-style formatting
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <div key={lineIndex} className="font-bold text-gray-800 mt-2">
                            {line.replace(/\*\*/g, '')}
                          </div>
                        );
                      } else if (line.startsWith('- ')) {
                        return (
                          <div key={lineIndex} className="ml-4 text-gray-700">
                            • {line.substring(2)}
                          </div>
                        );
                      } else if (line.startsWith('*') && line.endsWith('*')) {
                        return (
                          <div key={lineIndex} className="italic text-gray-600 mt-1">
                            {line.replace(/\*/g, '')}
                          </div>
                        );
                      } else if (line.trim() === '') {
                        return <br key={lineIndex} />;
                      } else {
                        return (
                          <div key={lineIndex} className="text-gray-800">
                            {line}
                          </div>
                        );
                      }
                    })}
                  </div>
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
