export interface AnalysisResult {
  title: string;
  notes?: string;
  suggestedTags: string[];
  priority?: 'high' | 'medium' | 'low';
  estimatedTime?: string;
  location?: string;
  participants: string[];
}

export async function analyzeTextWithAI(text: string, availableTags: string[]): Promise<AnalysisResult> {
  try {
    const prompt = `你现在是一个信息提取助手。请从以下文本中提取关键信息，并按照指定格式返回JSON。

示例输入：
"周四下午2点在图书馆和小明讨论项目方案"

示例输出：
{
  "title": "图书馆 小明 讨论 (周四 下午2点)",
  "notes": "项目方案",
  "suggestedTags": ["工作"],
  "priority": "medium",
  "estimatedTime": "周四 下午2点",
  "location": "图书馆",
  "participants": ["小明"]
}

现在请分析以下文本：
${text}

要求：
1. 必须严格按照示例格式返回JSON
2. title：提取地点、人物、动作，并将时间放在括号中
3. notes：提取具体的讨论/工作内容
4. suggestedTags：从这些标签中选择：${availableTags.join(', ')}
5. priority：根据紧急程度判断（high/medium/low）
6. estimatedTime：提取具体时间
7. location：提取地点信息
8. participants：提取所有参与者

请直接返回JSON，不要有任何其他内容。`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3:4b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // 降低随机性
          top_k: 10,       // 限制选择范围
          top_p: 0.8      // 限制采样范围
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Ollama API请求失败');
    }

    const data = await response.json();
    let result;
    try {
      // 尝试清理响应文本，只保留JSON部分
      const jsonStr = data.response.replace(/```json\s*|\s*```/g, '').trim();
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON解析失败:', e);
      // 如果 AI 分析失败，使用规则引擎作为后备方案
      return fallbackAnalysis(text, availableTags);
    }

    return {
      title: result.title || text,
      notes: result.notes,
      suggestedTags: Array.isArray(result.suggestedTags) ? result.suggestedTags : [],
      priority: result.priority || 'medium',
      estimatedTime: result.estimatedTime,
      location: result.location,
      participants: Array.isArray(result.participants) ? result.participants : []
    };
  } catch (error) {
    console.error('AI分析失败:', error);
    // 如果 AI 服务不可用，使用规则引擎作为后备方案
    return fallbackAnalysis(text, availableTags);
  }
}

// 规则引擎作为后备方案
export function fallbackAnalysis(text: string, availableTags: string[]): AnalysisResult {
  // 时间模式匹配
  const timePattern = /([今明后]天|下周|周[一二三四五六日天]|(\d{1,2})[:.：](\d{1,2})|[上下]午\d{1,2}[点时])/g;
  const timeMatches = text.match(timePattern) || [];
  
  // 地点模式匹配（在xxx）
  const locationPattern = /在([^，。；]+)(和|跟|与|同)/;
  const locationMatch = text.match(locationPattern);
  
  // 人物模式匹配（和xxx/跟xxx/与xxx）
  const peoplePattern = /(和|跟|与|同)([^，。；]+)(讨论|商议|商量|开会|见面)/;
  const peopleMatch = text.match(peoplePattern);
  
  // 事项模式匹配（讨论xxx/商议xxx/商量xxx）
  const actionPattern = /(讨论|商议|商量|开会|见面)([^，。；]+)/;
  const actionMatch = text.match(actionPattern);

  // 构建标题
  let titleParts = [];
  let notes = '';
  
  if (locationMatch) titleParts.push(locationMatch[1].trim());
  if (peopleMatch) titleParts.push(peopleMatch[2].trim());
  if (actionMatch) {
    titleParts.push(actionMatch[1].trim());
    notes = actionMatch[2].trim();
  }

  // 组织标题
  let title = titleParts.length > 0 ? titleParts.join(' ') : text;
  if (timeMatches.length > 0) {
    title += ` (${timeMatches.join(' ')})`;
  }

  // 根据内容推荐标签
  const suggestedTags = availableTags.filter(tag => {
    const lowerText = text.toLowerCase();
    switch (tag.toLowerCase()) {
      case '工作':
        return /工作|会议|报告|项目|方案/.test(lowerText);
      case '学习':
        return /学习|复习|考试|课程|读书|笔记/.test(lowerText);
      case '生活':
        return /吃饭|购物|运动|休息|娱乐/.test(lowerText);
      case '重要':
        return /重要|紧急|立即|马上/.test(lowerText);
      default:
        return false;
    }
  });

  // 判断优先级
  let priority: 'high' | 'medium' | 'low' | undefined;
  const lowerText = text.toLowerCase();
  if (/重要|紧急|立即|马上|尽快/.test(lowerText)) {
    priority = 'high';
  } else if (/尽快|尽快|尽快/.test(lowerText)) {
    priority = 'medium';
  } else {
    priority = 'low';
  }

  return {
    title,
    notes,
    suggestedTags,
    priority,
    estimatedTime: timeMatches.join(' '),
    location: locationMatch ? locationMatch[1].trim() : undefined,
    participants: peopleMatch ? [peopleMatch[2].trim()] : []
  };
} 