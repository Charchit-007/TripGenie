//Ui page for user chat interface
import React, { useState } from 'react';
import { Send, Loader2, Globe } from 'lucide-react';

const BASE_URL = "http://localhost:8000";

export default function TravelPlannerApp() {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${BASE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userInput }),
      });

      if (res.ok) {
        const data = await res.json();
        const answer = data.answer || "No answer returned.";
        const currentTime = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
        
        setResponse({
          answer,
          timestamp: currentTime,
        });
        setUserInput('');
      } else {
        const errorText = await res.text();
        setError(`Bot failed to respond: ${errorText}`);
      }
    } catch (err) {
      setError(`The response failed due to ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Globe className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              Travel Planner Agentic Application
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            How can I help you in planning a trip? Let me know where do you want to visit.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 mb-2">
                User Input
              </label>
              <input
                id="userInput"
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. Plan a trip to Goa for 5 days"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !userInput.trim()}
              className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Bot is thinking...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                <Globe className="w-8 h-8 text-indigo-600" />
                AI Travel Plan
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Generated:</strong> {response.timestamp}</p>
                <p><strong>Created by:</strong> Atriyo's Travel Agent</p>
              </div>
            </div>

            <div className="prose prose-indigo max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {response.answer}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 italic">
                *This travel plan was generated by AI. Please verify all information, especially prices, 
                operating hours, and travel requirements before your trip.*
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}