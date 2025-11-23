import React, { useRef, useEffect } from 'react';
import { Message } from '../lib/types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatPaneProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export default function ChatPane({ messages, onSendMessage, isProcessing }: ChatPaneProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">Chat with Helm</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update your project through conversation
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-2">👋 Welcome to Helm!</p>
            <p className="text-sm mb-4">
              Try creating a plan or managing an existing project:
            </p>
            <div className="text-sm space-y-3 max-w-md mx-auto">
              <div>
                <p className="font-semibold text-gray-700 mb-2">Create a new plan:</p>
                <ul className="text-left space-y-2">
                  <li className="bg-blue-50 p-2 rounded hover:bg-blue-100 cursor-pointer transition-colors" onClick={() => onSendMessage("Create a project plan for building a garden shed")}>"Create a project plan for building a garden shed"</li>
                  <li className="bg-blue-50 p-2 rounded hover:bg-blue-100 cursor-pointer transition-colors" onClick={() => onSendMessage("Plan a kitchen renovation project")}>"Plan a kitchen renovation project"</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Manage existing project:</p>
                <ul className="text-left space-y-2">
                  <li className="bg-gray-100 p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors" onClick={() => onSendMessage("James is ill and can't work")}>"James is ill and can't work"</li>
                  <li className="bg-gray-100 p-2 rounded hover:bg-gray-200 cursor-pointer transition-colors" onClick={() => onSendMessage("Site prep finished yesterday")}>"Site prep finished yesterday"</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Helm is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-gray-200">
        <ChatInput onSend={onSendMessage} disabled={isProcessing} />
      </div>
    </div>
  );
}
