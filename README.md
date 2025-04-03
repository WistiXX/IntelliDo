# IntelliDo

IntelliDo 是一个智能任务管理应用，它能帮助你更高效地组织和完成任务。通过集成多种 AI 服务，IntelliDo 可以智能分析任务内容，提供任务分解建议，并帮助你更好地规划时间。

## 特性

- 🤖 智能任务分析：自动分析任务内容，提供任务分解建议
- 📊 多维度任务管理：支持按优先级、截止日期等多个维度管理任务
- 🔄 灵活的 AI 服务支持：支持多种 AI 服务提供商（Ollama、OpenAI、Anthropic 等）
- 🎨 美观的用户界面：基于 Next.js 和 Tailwind CSS 构建的现代化界面
- 📱 响应式设计：完美支持桌面端和移动端

## 安装

1. 下载最新版本：
   - 访问 [Releases](https://github.com/WistiXX/IntelliDo/releases) 页面
   - 下载最新版本的源代码

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
   - 复制 `.env.example` 为 `.env`
   - 根据需要配置 AI 服务提供商的相关参数

4. 启动应用：
```bash
npm run dev
```

## 常见问题

**Q: 如何选择合适的 AI 服务提供商？**

A: IntelliDo 支持多种 AI 服务提供商，您可以根据自己的需求选择：
- Ollama：适合本地部署，无需联网
- OpenAI：提供最新的 GPT 模型
- Anthropic：提供 Claude 系列模型
- 自定义：支持配置其他 AI 服务

**Q: 应用支持哪些浏览器？**

A: IntelliDo 支持所有现代浏览器的最新版本，包括 Chrome、Firefox、Safari 和 Edge。

**Q: 数据是否会上传到云端？**

A: 所有任务数据都存储在本地，仅在使用在线 AI 服务时会发送必要的任务内容用于分析。

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。 
