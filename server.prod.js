
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
    origin: ['https://servicewechat.com'],
    credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;
        
        const response = await axios.post('https://api.deepseek.com/chat/completions', {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "你是一个关于临洮县非物质文化遗产的AI助手，请用中文回答。" },
                ...history,
                { role: "user", content: message }
            ],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        const aiResponse = response.data.choices[0]?.message?.content || '抱歉，我现在无法回答。';
        
        res.json({
            success: true,
            response: aiResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.response?.data?.error?.message || '服务器内部错误'
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 生产服务器运行在端口 ${PORT}`);
});
