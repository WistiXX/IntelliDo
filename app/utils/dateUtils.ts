interface TimeResult {
  startDate?: string;
  dueDate?: string;
}

export function parseDateTime(text: string): TimeResult {
  const now = new Date();
  const today = now.getDay(); // 0是周日，1是周一，以此类推

  // 处理"本周x"或"下周x"格式
  const weekdayPattern = /(本|这|下)?(周|星期)(一|二|三|四|五|六|日|天)/;
  
  // 处理具体时间（如：12:30）
  const timePattern = /(\d{1,2})[:.：](\d{1,2})/;

  // 处理"中午"、"下午"、"晚上"等时间描述
  const timeDescPattern = /(上午|中午|下午|晚上)?\s*(\d{1,2})[:.：](\d{1,2})/;

  try {
    // 1. 处理周几格式
    const weekdayMatch = text.match(weekdayPattern);
    if (weekdayMatch) {
      const weekType = weekdayMatch[1] || '本'; // 本周/下周
      const weekday = '日一二三四五六天'.indexOf(weekdayMatch[3]);
      const targetDay = weekday === -1 ? 0 : weekday; // 将"天"转换为0（周日）
      
      let daysToAdd = targetDay - today;
      if (daysToAdd <= 0 && weekType !== '下') {
        daysToAdd += 7; // 如果是本周但已过，加7天
      } else if (weekType === '下') {
        daysToAdd += 7; // 如果是下周，加7天
      }

      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysToAdd);

      // 2. 处理具体时间
      const timeMatch = text.match(timeDescPattern);
      if (timeMatch) {
        let [_, period, hour, minute] = timeMatch;
        let hourNum = parseInt(hour);
        
        // 处理时间段
        if (period === '下午' || period === '晚上' || (period === '中午' && hourNum !== 12)) {
          if (hourNum < 12) hourNum += 12;
        } else if (period === '上午' && hourNum === 12) {
          hourNum = 0;
        }

        targetDate.setHours(hourNum, parseInt(minute), 0, 0);
      } else {
        targetDate.setHours(0, 0, 0, 0);
      }

      // 根据文本内容判断是截止时间还是开始时间
      const isDeadline = /截止|之前|前|期限|deadline/i.test(text);
      const isStart = /开始|起|从|start/i.test(text);

      if (isDeadline) {
        return { dueDate: targetDate.toISOString() };
      } else if (isStart) {
        return { startDate: targetDate.toISOString() };
      } else {
        // 如果没有明确指出，根据上下文判断
        // 比如"会议将在"、"我们将在"这样的表述通常表示开始时间
        const isLikelyStart = /将在|在|订于|定于/i.test(text);
        if (isLikelyStart) {
          return { startDate: targetDate.toISOString() };
        } else {
          return { dueDate: targetDate.toISOString() };
        }
      }
    }

    return {};
  } catch (error) {
    console.error('时间解析错误:', error);
    return {};
  }
} 