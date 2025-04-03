'use client';

import React, { useState } from 'react';

interface Tag {
  name: string;
  color: string;
}

interface TagFilterProps {
  availableTags: Tag[];
  selectedTag: string;
  onSelectTag: (tagName: string) => void;
  onAddTag: (tag: Tag) => void;
  onDeleteTag: (tagName: string) => void;
  onEditTag: (oldTagName: string, newTag: Tag) => void;
}

const TAG_COLORS = [
  { name: '蓝色', value: 'blue' },
  { name: '绿色', value: 'green' },
  { name: '红色', value: 'red' },
  { name: '黄色', value: 'yellow' },
  { name: '紫色', value: 'purple' },
  { name: '粉色', value: 'pink' },
];

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

export default function TagFilter({ 
  availableTags, 
  selectedTag, 
  onSelectTag, 
  onAddTag,
  onDeleteTag,
  onEditTag 
}: TagFilterProps) {
  const [newTag, setNewTag] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagText, setEditTagText] = useState('');
  const [editTagColor, setEditTagColor] = useState('');

  const handleAddTag = () => {
    if (newTag.trim()) {
      onAddTag({ name: newTag.trim(), color: newTagColor });
      setNewTag('');
      setNewTagColor('blue');
      setIsAddingTag(false);
    }
  };

  const handleEditTag = (tagName: string) => {
    if (editTagText.trim()) {
      onEditTag(tagName, { 
        name: editTagText.trim(), 
        color: editTagColor 
      });
      setEditingTag(null);
      setEditTagText('');
      setEditTagColor('');
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingTag(tag.name);
    setEditTagText(tag.name);
    setEditTagColor(tag.color);
  };

  const renderColorSelector = (
    selectedColor: string,
    onChange: (color: string) => void
  ) => (
    <div className="flex flex-wrap gap-1 mt-2">
      {TAG_COLORS.map(color => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={`w-6 h-6 rounded-full border-2 ${
            selectedColor === color.value 
              ? 'border-gray-600' 
              : 'border-transparent'
          } ${getTagStyle(color.value).bg}`}
          title={color.name}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-col space-y-2">
        {availableTags.map(tag => (
          <div key={tag.name} className="flex items-center group">
            {editingTag === tag.name ? (
              <div className="flex-1 flex flex-col space-y-2">
                <input
                  type="text"
                  value={editTagText}
                  onChange={(e) => setEditTagText(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleEditTag(tag.name)}
                  autoFocus
                />
                {renderColorSelector(editTagColor, setEditTagColor)}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTag(tag.name)}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingTag(null)}
                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onSelectTag(tag.name)}
                  className={`flex-1 px-3 py-2 rounded-lg text-left ${
                    selectedTag === tag.name 
                      ? 'bg-blue-500 text-white' 
                      : `${getTagStyle(tag.color).bg} ${getTagStyle(tag.color).text} ${getTagStyle(tag.color).hoverBg}`
                  }`}
                >
                  {tag.name}
                </button>
                {tag.name !== '全部' && (
                  <div className="hidden group-hover:flex items-center ml-2">
                    <button
                      onClick={() => startEditing(tag)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => onDeleteTag(tag.name)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={() => setIsAddingTag(true)}
        className="mt-4 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 flex items-center justify-center"
      >
        <span className="mr-1">+</span> 添加标签
      </button>

      {isAddingTag && (
        <div className="mt-4 flex flex-col space-y-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="输入新标签..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
          />
          {renderColorSelector(newTagColor, setNewTagColor)}
          <div className="flex space-x-2">
            <button
              onClick={handleAddTag}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
            >
              添加
            </button>
            <button
              onClick={() => setIsAddingTag(false)}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 