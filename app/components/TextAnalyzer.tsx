'use client';

import React, { useState, useCallback } from 'react';
import { analyzeTextWithAI } from '../utils/textAnalysis';
import debounce from 'lodash/debounce';

interface Tag {
  name: string;
  color: string;
}

interface TextAnalyzerProps {
  availableTags: Tag[];
  onCreateTodo: (
    title: string,
    suggestedTags: string[],
    priority?: string,
    estimatedTime?: string,
    notes?: string
  ) => void;
}

interface AnalysisResult {
  title: string;
  notes?: string;
  suggestedTags: string[];
  priority?: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  location?: string;
  participants?: string[];
}

export default function TextAnalyzer({ availableTags, onCreateTodo }: TextAnalyzerProps) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedResult, setAnalyzedResult] = useState<AnalysisResult | null>(null);

  const debouncedAnalyze = useCallback(
    debounce(async (inputText: string) => {
      if (!inputText.trim()) {
        setAnalyzedResult(null);
        setError(null);
        return;
      }

      setIsAnalyzing(true);
      setError(null);
      
      try {
        const result = await analyzeTextWithAI(
          inputText,
          availableTags.map(tag => tag.name)
        );
        setAnalyzedResult(result);
      } catch (error) {
        console.error('分析失败:', error);
        setError('分析失败，请重试');
      } finally {
        setIsAnalyzing(false);
      }
    }, 1000),
    [availableTags]
  );

  const analyzeText = (inputText: string) => {
    setText(inputText);
    debouncedAnalyze(inputText);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    analyzeText(pastedText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    analyzeText(newText);
  };

  const handleCreateTodo = () => {
    if (analyzedResult) {
      onCreateTodo(
        analyzedResult.title,
        analyzedResult.suggestedTags,
        analyzedResult.priority,
        analyzedResult.estimatedTime,
        analyzedResult.notes
      );
      setText('');
      setAnalyzedResult(null);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3 text-gray-700">AI智能分析</h2>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <textarea
            value={text}
            onChange={handleTextChange}
            onPaste={handlePaste}
            placeholder="在此粘贴或输入文本，AI将自动分析并生成任务..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 resize-none"
          />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <div className="animate-pulse text-blue-500">AI分析中...</div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        {analyzedResult && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">任务标题：</div>
                <div className="text-gray-800 font-medium">{analyzedResult.title}</div>
              </div>
              
              {analyzedResult.notes && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">备注：</div>
                  <div className="text-gray-700 bg-white p-2 rounded">{analyzedResult.notes}</div>
                </div>
              )}
              
              {analyzedResult.suggestedTags.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">建议的标签：</div>
                  <div className="flex flex-wrap gap-2">
                    {analyzedResult.suggestedTags.map(tag => {
                      const tagInfo = availableTags.find(t => t.name === tag);
                      return (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            tagInfo?.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            tagInfo?.color === 'green' ? 'bg-green-100 text-green-800' :
                            tagInfo?.color === 'red' ? 'bg-red-100 text-red-800' :
                            tagInfo?.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">优先级：</div>
                  <div className={`font-medium ${getPriorityColor(analyzedResult.priority)}`}>
                    {analyzedResult.priority === 'high' ? '高' :
                     analyzedResult.priority === 'medium' ? '中' :
                     analyzedResult.priority === 'low' ? '低' : '未指定'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">预估时间：</div>
                  <div className="text-gray-800">{analyzedResult.estimatedTime}</div>
                </div>

                {analyzedResult.location && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">地点/平台：</div>
                    <div className="text-gray-800">{analyzedResult.location}</div>
                  </div>
                )}

                {analyzedResult.participants && analyzedResult.participants.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">参与者：</div>
                    <div className="flex flex-wrap gap-2">
                      {analyzedResult.participants.map(participant => (
                        <span
                          key={participant}
                          className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full"
                        >
                          {participant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreateTodo}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transform transition-all duration-200 hover:scale-105 active:scale-95"
              >
                添加为待办事项
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 