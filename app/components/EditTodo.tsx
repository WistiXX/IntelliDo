'use client';

import React, { useState, useEffect } from 'react';

interface Tag {
  name: string;
  color: string;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  priority?: 'high' | 'medium' | 'low';
}

interface EditTodoProps {
  todo: Todo;
  availableTags: Tag[];
  onEdit: (id: number, text: string, selectedTags: string[], startDate?: string, dueDate?: string) => void;
  onCancel: () => void;
}

export default function EditTodo({ todo, availableTags, onEdit, onCancel }: EditTodoProps) {
  const [text, setText] = useState(todo.text);
  const [selectedTags, setSelectedTags] = useState<string[]>(todo.tags);
  const [startDate, setStartDate] = useState(todo.startDate || '');
  const [dueDate, setDueDate] = useState(todo.dueDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onEdit(todo.id, text, selectedTags, startDate, dueDate);
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4 text-gray-700">编辑任务</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="任务内容"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
          <input
            type="datetime-local"
            value={startDate ? new Date(startDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">截止时间</label>
          <input
            type="datetime-local"
            value={dueDate ? new Date(dueDate).toISOString().slice(0, 16) : ''}
            onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value).toISOString() : '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag.name}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag.name)
                    ? tag.color === 'blue' ? 'bg-blue-500 text-white' :
                      tag.color === 'green' ? 'bg-green-500 text-white' :
                      tag.color === 'red' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-white'
                    : tag.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                      tag.color === 'green' ? 'bg-green-100 text-green-800' :
                      tag.color === 'red' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                } transition-colors duration-200`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
} 