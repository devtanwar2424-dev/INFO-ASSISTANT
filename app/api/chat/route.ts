import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

// Markdown symbols ko clean karne ke liye function
function cleanMarkdownText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '') 
    .replace(/\*\*/g, '')     
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1: $2'); 
}

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ 
        reply: 'API key is missing in environment variables. Please check your .env.local file.' 
      }, { status: 500 });
    }

    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return NextResponse.json({ reply: 'No messages provided.' }, { status: 400 });
    }

    const rawMessage = messages[messages.length - 1].content.trim();
    const latestMessage = rawMessage.toLowerCase();

    // 1. INSTANT GREETINGS CHECK
    const greetings = ['hi', 'hello', 'hey', 'hii', 'hy', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hey there'];
    if (greetings.includes(latestMessage)) {
      return NextResponse.json({
        reply: "Hello! I am Info Assistant. How can I help you with our available courses, fee details, or admission guidelines today?",
        sources: []
      });
    }

    // 2. KNOWLEDGE BASE READ
    const kbDir = path.join(process.cwd(), 'app/knowledge-base');
    let coursesContent = '';
    let feesContent = '';
    let faqsContent = '';

    if (fs.existsSync(kbDir)) {
      const files = fs.readdirSync(kbDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(kbDir, file);
          const rawContent = fs.readFileSync(filePath, 'utf-8');
          const lowerFileName = file.toLowerCase();

          if (lowerFileName.includes('course')) coursesContent = rawContent;
          else if (lowerFileName.includes('fee')) feesContent = rawContent;
          else if (lowerFileName.includes('faq') || lowerFileName.includes('admission')) faqsContent = rawContent;
        }
      }
    }

    // 3. EXACT BUTTON CLICKS
    if (latestMessage === 'which courses are available?') {
      return NextResponse.json({ reply: cleanMarkdownText(coursesContent), sources: ['courses.md'] });
    }
    if (latestMessage === 'can you tell me about the fees structure?' || latestMessage === 'check fee details') {
      return NextResponse.json({ reply: cleanMarkdownText(feesContent), sources: ['fees.md'] });
    }
    if (latestMessage === 'what are the admission requirements?' || latestMessage === 'admission guidelines') {
      return NextResponse.json({ reply: cleanMarkdownText(faqsContent), sources: ['faqs.md'] });
    }

    // 4. PROGRAMMATIC SPECIFIC FILTERING (Agar user specific course fee puche)
    if (latestMessage.includes('fee') || latestMessage.includes('cost')) {
      if (latestMessage.includes('web development')) {
        return NextResponse.json({
          reply: "Web Development\nCourse fee: Rs. 8,000.",
          sources: ['fees.md']
        });
      }
      if (latestMessage.includes('python')) {
        return NextResponse.json({
          reply: "Python Programming\nCourse fee: Rs. 5,000.",
          sources: ['fees.md']
        });
      }
      if (latestMessage.includes('artificial intelligence') || latestMessage.includes('ai')) {
        return NextResponse.json({
          reply: "Artificial Intelligence\nCourse fee: Rs. 12,000.",
          sources: ['fees.md']
        });
      }
    }

    if (latestMessage.includes('course') || latestMessage.includes('duration') || latestMessage.includes('topic')) {
      if (latestMessage.includes('web development')) {
        return NextResponse.json({
          reply: "Web Development\nDuration: 3 months.\nTopics: HTML, CSS, JavaScript, React, and Next.js.",
          sources: ['courses.md']
        });
      }
      if (latestMessage.includes('python')) {
        return NextResponse.json({
          reply: "Python Programming\nDuration: 2 months.\nTopics: Python basics, loops, functions, file handling, and projects.",
          sources: ['courses.md']
        });
      }
      if (latestMessage.includes('artificial intelligence') || latestMessage.includes('ai')) {
        return NextResponse.json({
          reply: "Artificial Intelligence\nDuration: 4 months.\nTopics: AI fundamentals, machine learning basics, and AI-powered applications.",
          sources: ['courses.md']
        });
      }
    }

    // 5. GENERAL FALLBACK
    return NextResponse.json({
      reply: cleanMarkdownText(feesContent || coursesContent),
      sources: ['fees.md', 'courses.md']
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      reply: 'Hello! I am Info Assistant. How can I help you today?' 
    }, { status: 200 });
  }
}