interface Tag {
  name: string;
  color: string;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  tags: string[];
  createdAt: string;
  startDate?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
}

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  availableTags: Tag[];
}

const getTagStyle = (color: string) => {
  const styles: { [key: string]: { bg: string, text: string } } = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
    green: { bg: 'bg-green-100', text: 'text-green-800' },
    red: { bg: 'bg-red-100', text: 'text-red-800' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-800' },
  };
  return styles[color] || styles.blue;
};

const getPriorityBadge = (priority?: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">高优先级</span>;
    case 'medium':
      return <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">中优先级</span>;
    case 'low':
      return <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">低优先级</span>;
    default:
      return null;
  }
};

export default function TodoList({ todos, onToggle, onDelete, onEdit, availableTags }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-6 py-10">
        <p>还没有待办事项</p>
        <p className="text-sm mt-2">请在上方添加新任务</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 对于创建时间，显示完整的日期时间
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  const getTagColor = (tagName: string): string => {
    const tag = availableTags.find(t => t.name === tagName);
    return tag?.color || 'blue';
  };

  return (
    <div>
      <h2 className="text-lg font-medium my-4 text-gray-700">任务列表</h2>
      <ul className="space-y-3">
        {todos.map(todo => (
          <li
            key={todo.id}
            className="flex flex-col bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center flex-1">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onToggle(todo.id)}
                  className="h-5 w-5 text-blue-600 transition-colors duration-200"
                />
                <span
                  className={`ml-3 flex-1 ${
                    todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {todo.text}
                </span>
                {getPriorityBadge(todo.priority)}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(todo)}
                  className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                >
                  编辑
                </button>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  删除
                </button>
              </div>
            </div>
            
            <div className="flex flex-col pl-8 space-y-2">
              <div className="text-xs text-gray-400 flex flex-wrap items-center gap-4">
                <span className="whitespace-nowrap">
                  创建于: {todo.createdAt}
                </span>
                {todo.startDate && (
                  <span className="text-sm text-blue-600 whitespace-nowrap">
                    开始: {formatDate(todo.startDate)}
                  </span>
                )}
                {todo.dueDate && (
                  <span className={`text-sm whitespace-nowrap ${
                    new Date(todo.dueDate) < new Date() ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    截止: {formatDate(todo.dueDate)}
                  </span>
                )}
              </div>
              
              {todo.notes && (
                <div className="mt-1 text-sm text-gray-600 bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition-colors duration-200">
                  <div className="font-medium text-gray-700 mb-1">备注:</div>
                  <div className="whitespace-pre-wrap">{todo.notes}</div>
                </div>
              )}
              
              {todo.tags && todo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {todo.tags.map(tag => {
                    const tagColor = getTagColor(tag);
                    const style = getTagStyle(tagColor);
                    return (
                      <span 
                        key={tag} 
                        className={`px-2 py-0.5 rounded-full text-xs transform transition-all duration-200 hover:scale-105 ${style.bg} ${style.text}`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 