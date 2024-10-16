     // routes/ai.ts
     import express from 'express';
     import axios from 'axios';
     import dotenv from 'dotenv';

     dotenv.config();
     const router = express.Router();

     router.post('/ask', async (req, res) => {
         const { question, code } = req.body;

         if (!question || typeof question !== 'string') {
             return res.status(400).json({ error: 'Invalid question format. "question" must be a non-empty string.' });
         }

         let prompt = `User: ${question}\n`;
         if (code && typeof code === 'string') {
             prompt += `Code Context: ${code}\n`;
         }
         prompt += `AI Assistant:`;

         try {
             const response = await axios.post(
                 'https://api-inference.huggingface.co/models/bigcode/starcoder',
                 {
                     inputs: prompt,
                     parameters: {
                         max_new_tokens: 150,
                         temperature: 0.2,
                         top_p: 0.95,
                         repetition_penalty: 1.2,
                     },
                 },
                 {
                     headers: {
                         'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                         'Content-Type': 'application/json',
                     },
                 }
             );

             const generatedText = response.data?.[0]?.generated_text || response.data?.generated_text || "No response from model.";
             const answer = generatedText.replace(/^AI Assistant:/i, '').trim();
             res.json({ answer });
         } catch (error: any) {
             console.error("Error fetching from Hugging Face:", error.response?.data || error.message || error);
             res.status(500).json({ error: 'Failed to get response from AI model.' });
         }
     });

     export default router;