'use client';

import React, { useState } from 'react';
import TodoList from './components/TodoList';
import AddTodo from './components/AddTodo';
import TagFilter from './components/TagFilter';
import TextAnalyzer from './components/TextAnalyzer';
import { parseDateTime } from './utils/dateUtils';
import EditTodo from './components/EditTodo';

interface Tag {
  name: string;
  color: string;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  startDate?: string;
  dueDate?: string;
  tags: string[];
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([
    { name: '工作', color: 'blue' },
    { name: '学习', color: 'green' },
    { name: '生活', color: 'yellow' },
    { name: '重要', color: 'red' }
  ]);
  const [selectedTag, setSelectedTag] = useState<string>('全部');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // 获取已筛选的待办事项
  const filteredTodos = selectedTag === '全部' 
    ? todos 
    : todos.filter(todo => todo.tags.includes(selectedTag));

  const addTodo = (
    text: string,
    selectedTags: string[],
    startDate?: string,
    dueDate?: string,
    priority?: 'high' | 'medium' | 'low',
    notes?: string
  ) => {
    const now = new Date();
    const dateStr = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    setTodos([...todos, { 
      id: Date.now().toString(), 
      text, 
      completed: false, 
      createdAt: dateStr,
      startDate,
      dueDate,
      tags: selectedTags,
      priority,
      notes
    }]);
  };

  const handleAnalyzedText = (
    title: string,
    suggestedTags: string[],
    priority?: string,
    estimatedTime?: string,
    notes?: string
  ) => {
    let startDate: string | undefined;
    let dueDate: string | undefined;

    if (estimatedTime) {
      const parsedDates = parseDateTime(title);
      startDate = parsedDates.startDate;
      dueDate = parsedDates.dueDate;
    }

    addTodo(
      title,
      suggestedTags,
      startDate,
      dueDate,
      priority as 'high' | 'medium' | 'low',
      notes
    );
  };

  const editTodo = (
    id: string, 
    text: string, 
    selectedTags: string[], 
    startDate?: string, 
    dueDate?: string,
    notes?: string
  ) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, text, tags: selectedTags, startDate, dueDate, notes }
        : todo
    ));
    setEditingTodo(null);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const addNewTag = (tag: Tag) => {
    if (tag.name && !availableTags.some(t => t.name === tag.name)) {
      setAvailableTags([...availableTags, tag]);
    }
  };

  const deleteTag = (tagName: string) => {
    // 从可用标签中删除
    setAvailableTags(availableTags.filter(tag => tag.name !== tagName));
    // 如果当前选中的是被删除的标签，切换到"全部"
    if (selectedTag === tagName) {
      setSelectedTag('全部');
    }
    // 从所有待办事项中移除该标签
    setTodos(todos.map(todo => ({
      ...todo,
      tags: todo.tags.filter(tag => tag !== tagName)
    })));
  };

  const editTag = (oldTagName: string, newTag: Tag) => {
    // 更新可用标签
    setAvailableTags(availableTags.map(tag => 
      tag.name === oldTagName ? newTag : tag
    ));
    // 如果当前选中的是被编辑的标签，更新选中标签
    if (selectedTag === oldTagName) {
      setSelectedTag(newTag.name);
    }
    // 更新所有待办事项中的标签
    setTodos(todos.map(todo => ({
      ...todo,
      tags: todo.tags.map(tag => 
        tag === oldTagName ? newTag.name : tag
      )
    })));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex responsive-layout py-5">
      {/* 左侧边栏 - 标题和标签管理 */}
      <div className="w-72 bg-white shadow-lg rounded-lg p-6 sidebar min-h-screen sticky top-0 ml-4">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          待办事项
        </h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-medium mb-4 text-gray-700 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"></path>
            </svg>
            标签分类
          </h2>
          <TagFilter 
            availableTags={[{ name: '全部', color: 'blue' }, ...availableTags]} 
            selectedTag={selectedTag} 
            onSelectTag={setSelectedTag}
            onAddTag={addNewTag}
            onDeleteTag={deleteTag}
            onEditTag={editTag}
          />
        </div>
      </div>
      
      {/* 右侧主内容区 - 添加任务和任务列表 */}
      <div className="flex-1 p-5 ml-6 main-content">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              添加新任务
            </h2>
            <TextAnalyzer
              availableTags={availableTags}
              onCreateTodo={handleAnalyzedText}
            />
          </div>
          
          <div className="border-t border-gray-200 my-8 opacity-30"></div>
          
          <div className="mb-8">
            {editingTodo ? (
              <EditTodo
                todo={editingTodo}
                availableTags={availableTags}
                onEdit={editTodo}
                onCancel={() => setEditingTodo(null)}
              />
            ) : (
              <AddTodo 
                onAdd={addTodo} 
                availableTags={availableTags}
              />
            )}
          </div>
          
          <TodoList 
            todos={filteredTodos} 
            onToggle={toggleTodo} 
            onDelete={deleteTodo}
            onEdit={setEditingTodo}
            availableTags={availableTags}
          />
        </div>
      </div>
    </main>
  );
} 