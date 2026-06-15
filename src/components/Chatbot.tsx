'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

// 1. Memoized Message Item Component to prevent unnecessary list reflows/re-renders
export const ChatMessageItem = React.memo(function ChatMessageItem({ message }: { message: Message }) {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`px-3.5 py-2.5 text-xs max-w-[85%] leading-relaxed select-text ${
          isUser
            ? 'bg-blue-600/10 border border-blue-500/20 text-blue-100 rounded-2xl rounded-tr-none text-left'
            : 'bg-white/[0.04] border border-white/[0.06] text-zinc-200 rounded-2xl rounded-tl-none text-left'
        }`}
      >
        {message.text.includes('```') || message.text.includes('**') ? (
          <div className="space-y-2">
            {message.text.split('```').map((part, index) => {
              if (index % 2 === 1) {
                const lines = part.trim().split('\n');
                const firstLine = lines[0].trim();
                const isCodeBlock = ['javascript', 'js', 'python', 'json', 'bash', 'curl'].includes(firstLine);
                const code = isCodeBlock ? lines.slice(1).join('\n') : part.trim();
                const color = firstLine === 'json' ? 'text-green-400' : firstLine === 'python' ? 'text-yellow-400' : 'text-blue-400';
                
                return (
                  <div key={index} className="my-2 rounded-xl bg-zinc-950 border border-white/[0.04] overflow-hidden">
                    {isCodeBlock && (
                      <div className="bg-zinc-900/50 px-3 py-1.5 border-b border-white/[0.04] text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                        {firstLine}
                      </div>
                    )}
                    <pre className={`p-3 text-[10px] font-mono ${color} overflow-x-auto select-text leading-normal`}>
                      <code>{code}</code>
                    </pre>
                  </div>
                );
              }
              const boldParts = part.split('**');
              return (
                <p key={index} className="whitespace-pre-line text-zinc-300">
                  {boldParts.map((bp, i) => i % 2 === 1 ? <strong key={i} className="text-white font-bold">{bp}</strong> : bp)}
                </p>
              );
            })}
          </div>
        ) : (
          <p className="whitespace-pre-line text-zinc-300">{message.text}</p>
        )}
      </div>
    </motion.div>
  );
});

// 2. Memoized Suggestion Pill Component to avoid inline closures
interface SuggestionPillProps {
  label: string;
  query: string;
  onClick: (query: string) => void;
}

const SuggestionPill = React.memo(function SuggestionPill({ label, query, onClick }: SuggestionPillProps) {
  const handleClick = useCallback(() => {
    onClick(query);
  }, [onClick, query]);

  return (
    <button
      onClick={handleClick}
      type="button"
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] text-zinc-400 hover:text-white font-medium transition-all"
    >
      <HelpCircle className="h-3 w-3 text-purple-400" />
      <span>{label}</span>
    </button>
  );
});

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am SharpBot, your developer assistant. How can I help you integrate SHARP rewards today?',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Scroll optimization references
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userIsScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSentRef = useRef(false);

  const suggestionPrompts = [
    { label: 'How do I reward users?', query: 'How do I reward users?' },
    { label: 'What is the contract address?', query: 'What is the contract address?' },
    { label: 'How do I check a balance?', query: 'How do I check a user balance?' },
    { label: 'Are gas fees sponsored?', query: 'Are gas fees sponsored?' },
  ];

  // Debounced scroll listener to detect user scrolling activity
  const handleScroll = () => {
    userIsScrollingRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      userIsScrollingRef.current = false;
    }, 180);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Memoized message dispatch handler
  const handleSendMessage = useCallback((text: string) => {
    if (!text.trim()) return;

    justSentRef.current = true;

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getBotResponse(text);
      const botMessage: Message = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'bot',
        text: responseText,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1200);
  }, []);

  const isNearBottom = () => {
    const el = scrollContainerRef.current;
    if (!el) return false;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  // Auto-scroll the container smoothly to the bottom only if appropriate
  useEffect(() => {
    const userSent = justSentRef.current;
    if (justSentRef.current) {
      justSentRef.current = false;
    }

    if ((isNearBottom() || userSent) && !userIsScrollingRef.current) {
      requestAnimationFrame(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [messages, isTyping]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div data-tour="chatbot" className="fixed bottom-6 right-6 z-50 pointer-events-auto">
      {/* Floating Toggle Button */}
      <button
        onClick={toggleOpen}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-lg hover:scale-105 active:scale-95 transition-all outline-none border-none cursor-pointer group"
      >
        <MessageSquare className="h-6 w-6 group-hover:rotate-6 transition-transform" />
        <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 opacity-20 blur group-hover:opacity-40 transition-opacity" />
      </button>

      {/* Glass Chat Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-18 right-0 w-[360px] sm:w-[380px] h-[480px] flex flex-col rounded-3xl border border-white/[0.08] bg-[#0c0d10]/92 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-white/[0.02] text-left">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>SharpBot</span>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                  </h3>
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Developer AI Helper</span>
                </div>
              </div>
              <button
                onClick={toggleOpen}
                className="h-7 w-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border-none outline-none cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conversation Messages Container */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar scroll-smooth"
            >
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="px-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* suggestion pills */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5 justify-start bg-white/[0.01] border-t border-white/[0.04]">
                {suggestionPrompts.map((p) => (
                  <SuggestionPill
                    key={p.query}
                    label={p.label}
                    query={p.query}
                    onClick={handleSendMessage}
                  />
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-4 border-t border-white/[0.06] bg-white/[0.02] flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputValue);
                }}
                placeholder="Ask SharpBot a developer question..."
                className="flex-1 bg-zinc-950 border border-white/[0.08] focus:border-blue-500/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer border-none outline-none"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper query generator
const getBotResponse = (query: string): string => {
  const q = query.toLowerCase();

  if (q.includes('reward') || q.includes('distribute') || q.includes('mint')) {
    const amountMatch = q.match(/(\d+)\s*(?:sharp|tokens|coins)?/);
    const amount = amountMatch ? amountMatch[1] : '50';
    
    const triggerMatch = q.match(/(?:after|when|finishing|for)\s+([a-zA-Z0-9\s]+)/);
    const rawTrigger = triggerMatch ? triggerMatch[1].trim() : 'custom_action';
    const trigger = rawTrigger.toLowerCase().replace(/\s+/g, '_');

    return `**✨ Natural Language Reward Builder**
I've analyzed your request and generated the integration specs.

**Detected Logic:**
- **Trigger Event:** \`${trigger}\`
- **Reward Amount:** \`${amount} SHARP\`

Here is how to integrate this across your stack:

**1. Webhook Configuration (JSON)**
\`\`\`json
{
  "event": "${trigger}",
  "action": "reward_user",
  "payload": {
    "amount": ${amount},
    "currency": "SHARP"
  }
}
\`\`\`

**2. Node.js (Server-Side)**
\`\`\`javascript
app.post('/webhook/${trigger}', async (req, res) => {
  const { userWallet } = req.body;
  await sharpflow.rewardUser({
    wallet: userWallet,
    amount: ${amount}
  });
  res.send('Reward Sent!');
});
\`\`\`

**3. Python**
\`\`\`python
@app.route('/webhook/${trigger}', methods=['POST'])
def handle_${trigger}():
    wallet = request.json['userWallet']
    client.reward_user(wallet=wallet, amount=${amount})
    return "Reward Sent!"
\`\`\`

**4. cURL**
\`\`\`bash
curl -X POST https://api.sharpflow.ai/api/reward \\
  -H "x-api-key: sf_live_..." \\
  -d '{"wallet":"0x...", "amount":${amount}}'
\`\`\``;
  }

  if (q.includes('contract') || q.includes('address') || q.includes('erc20')) {
    return `The SHARP ERC-20 utility token is compiled using OpenZeppelin standards.

Contract Config:
- Symbol: SHARP
- Network: Polygon Amoy Testnet
- Status: Connected (relayer wallet is active)
- Sandbox mode uses fallback local ledger mocks if CONTRACT_ADDRESS env variables are empty.`;
  }

  if (q.includes('balance') || q.includes('query')) {
    return `To fetch a user's current token balance on-chain, issue a GET request:

GET /api/balance?wallet=0x70997970C518...

SDK wrapper:
\`\`\`javascript
const balance = await sharpflow.getBalance("0x70997970C518...");
console.log(balance); // Returns number
\`\`\``;
  }

  if (q.includes('gas') || q.includes('fee') || q.includes('relay') || q.includes('matic')) {
    return `Yes! SharpFlow fully sponsors gas fees. Transactions are relayed by our centralized Polygon relayer wallet. 

Your application's end-users do not need to hold MATIC or pay any on-chain gas fees to receive rewards.`;
  }

  return `I'm here to help! You can ask about:
- "Reward users with 100 SHARP after finishing 5 lessons."
- "How do I reward customers after purchases?"
- "What is the token contract address?"
- "Are gas fees sponsored?"`;
};
