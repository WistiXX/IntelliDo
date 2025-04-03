'use client';

import React, { useState } from 'react';

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
}

interface AddTodoProps {
  onAdd: (text: string, selectedTags: string[], startDate?: string, dueDate?: string) => void;
  onEdit?: (id: number, text: string, selectedTags: string[], startDate?: string, dueDate?: string) => void;
  availableTags: Tag[];
  editingTodo?: Todo | null;
}

const getTagStyle = (color: string) => {
  const styles: { [key: string]: { bg: string, text: string, hoverBg: string } } = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', hoverBg: 'hover:bg-blue-200' },
    green: { bg: 'bg-green-100', text: 'text-green-800', hoverBg: 'hover:bg-green-200' },
    red: { bg: 'bg-red-100', text: 'text-red-800', hoverBg: 'hover:bg-red-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', hoverBg: 'hover:bg-yellow-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800', hoverBg: 'hover:bg-purple-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-800', hoverBg: 'hover:bg-pink-200' },
  };
  return styles[color] || styles.blue;
};

export default function AddTodo({ onAdd, onEdit, availableTags, editingTodo }: AddTodoProps) {
  const today = new Date().toISOString().split('T')[0];
  const [text, setText] = useState(editingTodo?.text || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(editingTodo?.tags || []);
  const [startDate, setStartDate] = useState(editingTodo?.startDate || today);
  const [dueDate, setDueDate] = useState(editingTodo?.dueDate || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    if (editingTodo && onEdit) {
      onEdit(editingTodo.id, text.trim(), selectedTags, startDate, dueDate || undefined);
    } else {
      onAdd(text.trim(), selectedTags, startDate, dueDate || undefined);
    }
    
    // 重置表单
    setText('');
    setSelectedTags([]);
    setStartDate(today);
    setDueDate('');
    setIsExpanded(false);
  };

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const validateDates = (newStartDate: string, newDueDate: string) => {
    if (newDueDate && newStartDate > newDueDate) {
      setDueDate(newStartDate);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 transition-all duration-300 ease-in-out">
      <h2 className="text-lg font-medium mb-3 text-gray-700 flex items-center">
        <span className="flex-1">{editingTodo ? '编辑任务' : '添加新任务'}</span>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? '收起选项 ▼' : '展开选项 ▶'}
        </button>
      </h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={text}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          placeholder="添加新的待办事项..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
        />

        <div className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">开始日期</label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  validateDates(e.target.value, dueDate);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">截止日期</label>
              <input
                type="date"
                value={dueDate}
                min={startDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-sm text-gray-600">选择标签:</div>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50">
              {availableTags.map(tag => (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm transform transition-all duration-200 hover:scale-105 ${
                    selectedTags.includes(tag.name)
                      ? 'bg-blue-500 text-white'
                      : `${getTagStyle(tag.color).bg} ${getTagStyle(tag.color).text} ${getTagStyle(tag.color).hoverBg}`
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transform transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {editingTodo ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </form>
  );
} 