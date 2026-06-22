'use client';

import { useState, useEffect, useRef } from 'react';
import { DocumentType, DocumentFormData } from '@/types/documents';
import { ChatMessage, ChatResponse, extractFieldsFromResponse, parseDocumentType } from '@/types/chat';
import { getGreeting, sendMessage } from '@/services/chatApi';

interface ChatInterfaceProps {
  formData: DocumentFormData;
  onDocumentTypeDetected: (type: DocumentType) => void;
  onFieldsExtracted: (fields: Partial<DocumentFormData>) => void;
  onComplete: () => void;
}

export function ChatInterface({
  formData,
  onDocumentTypeDetected,
  onFieldsExtracted,
  onComplete,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentTypeDetected, setDocumentTypeDetected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to newest message whenever the list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Return focus to input after each AI response so the user can type immediately
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [isLoading, messages.length]);

  // Fetch the opening greeting on first render
  useEffect(() => {
    async function loadGreeting() {
      setIsLoading(true);
      try {
        const greeting = await getGreeting();
        setMessages([{ role: 'assistant', content: greeting.response }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not connect to AI assistant');
      } finally {
        setIsLoading(false);
      }
    }
    loadGreeting();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedHistory = [...messages, userMsg];

    setMessages(updatedHistory);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const reply: ChatResponse = await sendMessage(updatedHistory);

      setMessages((prev) => [...prev, { role: 'assistant', content: reply.response }]);

      if (!documentTypeDetected && reply.documentType) {
        const docType = parseDocumentType(reply.documentType);
        if (docType) {
          setDocumentTypeDetected(true);
          onDocumentTypeDetected(docType);
        }
      }

      const extracted = extractFieldsFromResponse(reply);
      if (Object.keys(extracted).length > 0) {
        onFieldsExtracted(extracted);
      }

      if (reply.isComplete) {
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message history */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.role === 'user' ? 'bg-[#209dd7] text-white' : 'bg-slate-100 text-slate-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
