'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Play, Code2, AlertCircle, CheckCircle2, ChevronRight, 
  Server, Link2, Bell, ShieldCheck, ShieldAlert, BadgeInfo, Zap, 
  HelpCircle, Eye, Rocket, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import GlassCard from './GlassCard';
import { useSharpStore } from '@/hooks/useSharpStore';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'chain' | 'notification';
  label: string;
  desc: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  icon: any;
  color: string;
}

interface ExtractionItem {
  key: string;
  value: string;
  confidence: number;
}

export default function AiWorkflowBuilder() {
  const { addTransaction, incrementApiCalls } = useSharpStore();
  const [prompt, setPrompt] = useState('Reward users with 50 SHARP after signup and notify Discord');
  const [isParsing, setIsParsing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(-1);
  const [activeCodeTab, setActiveCodeTab] = useState<'json' | 'node' | 'python' | 'webhook'>('json');
  const [copied, setCopied] = useState(false);
  const [executionMode, setExecutionMode] = useState<'dry_run' | 'deploy'>('dry_run');

  // AI inference state
  const [intentClass, setIntentClass] = useState('REWARD_TRIGGER');
  const [intentConfidence, setIntentConfidence] = useState(0.96);
  const [extractions, setExtractions] = useState<ExtractionItem[]>([]);

  // Policy validation checks
  const [policyChecks, setPolicyChecks] = useState([
    { id: 'limit_check', name: 'Single Transaction Ceiling (< 1,000 SHARP)', status: 'pass', desc: 'Requested amount fits below maximum ceiling limit' },
    { id: 'permissions', name: 'API Scope Authorization check', status: 'pass', desc: 'Current API scope has write:rewards enabled' },
    { id: 'recursion', name: 'Anti-Recursion Safety Loop scanner', status: 'pass', desc: 'No loop triggers or recursive actions detected' },
    { id: 'sybil', name: 'Sybil Threshold validation', status: 'pass', desc: 'Required IP + Wallet cooldown headers included' },
  ]);

  // Parsed config
  const [parsedTrigger, setParsedTrigger] = useState('user_signup');
  const [parsedAmount, setParsedAmount] = useState(50);
  const [parsedChannel, setParsedChannel] = useState<'discord' | 'slack' | 'email'>('discord');

  const suggestionPrompts = [
    'Reward users with 100 SHARP after checkout completed and send Slack alert',
    'Give 25 tokens on daily login streak and notify email',
    'Reward 150 tokens when lesson completed and send Discord notification',
  ];

  const parsePromptText = (text: string, isInitial = false) => {
    setIsParsing(true);
    setTimeout(() => {
      const lower = text.toLowerCase();
      
      // Amount
      const amtMatch = lower.match(/(\d+)\s*(?:sharp|tokens|coins)?/);
      const amount = amtMatch ? parseInt(amtMatch[1]) : 50;
      setParsedAmount(amount);

      // Trigger
      let trigger = 'custom_action';
      if (lower.includes('signup') || lower.includes('registration')) {
        trigger = 'user_signup';
      } else if (lower.includes('checkout') || lower.includes('purchase') || lower.includes('buy')) {
        trigger = 'checkout_completed';
      } else if (lower.includes('login') || lower.includes('streak')) {
        trigger = 'daily_login';
      } else if (lower.includes('lesson') || lower.includes('completed')) {
        trigger = 'lesson_completed';
      }
      setParsedTrigger(trigger);

      // Notification channel
      let channel: 'discord' | 'slack' | 'email' = 'discord';
      if (lower.includes('slack')) {
        channel = 'slack';
      } else if (lower.includes('email') || lower.includes('mail')) {
        channel = 'email';
      }
      setParsedChannel(channel);

      // NLP Intent classifier simulation
      const classification = lower.includes('reward') || lower.includes('give') 
        ? 'REWARD_TRIGGER' 
        : lower.includes('spend') || lower.includes('deduct') 
        ? 'SPEND_GATEWAY' 
        : 'OBSERVATION_ALERT';
      setIntentClass(classification);

      // Random high confidence
      const confidence = parseFloat((0.92 + Math.random() * 0.07).toFixed(2));
      setIntentConfidence(confidence);

      // Extractions mapping
      setExtractions([
        { key: 'Trigger Source', value: trigger, confidence: 0.98 },
        { key: 'Reward Token', value: 'SHARP', confidence: 0.99 },
        { key: 'Amount Bound', value: `${amount} SHARP`, confidence: 0.97 },
        { key: 'Target Notify', value: channel, confidence: 0.95 }
      ]);

      // Update policy limit status dynamically
      setPolicyChecks([
        { 
          id: 'limit_check', 
          name: 'Single Transaction Ceiling (< 1,000 SHARP)', 
          status: amount < 1000 ? 'pass' : 'fail', 
          desc: amount < 1000 ? 'Requested amount fits below maximum ceiling limit' : '⚠️ Amount exceeds the 1,000 SHARP safety cap!' 
        },
        { id: 'permissions', name: 'API Scope Authorization check', status: 'pass', desc: 'Current API scope has write:rewards enabled' },
        { id: 'recursion', name: 'Anti-Recursion Safety Loop scanner', status: 'pass', desc: 'No loop triggers or recursive actions detected' },
        { id: 'sybil', name: 'Sybil Threshold validation', status: 'pass', desc: 'Required IP + Wallet cooldown headers included' },
      ]);

      setIsParsing(false);
      if (!isInitial) {
        toast.success('LLM classification and policy parsing complete!');
      }
    }, 850);
  };

  useEffect(() => {
    parsePromptText(prompt, true);
  }, []);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    parsePromptText(prompt, false);
  };

  const handleSuggestionClick = (s: string) => {
    setPrompt(s);
    parsePromptText(s, false);
  };

  // Node Setup
  const nodes: WorkflowNode[] = [
    {
      id: 'trigger',
      type: 'trigger',
      label: `Trigger: ${parsedTrigger.toUpperCase().replace('_', ' ')}`,
      desc: 'Monitors client API call actions',
      status: simulationStep >= 0 ? (simulationStep > 0 ? 'success' : 'running') : 'idle',
      icon: Server,
      color: 'blue',
    },
    {
      id: 'reward',
      type: 'action',
      label: `Reward Engine (+${parsedAmount} SHARP)`,
      desc: 'Authorizes on-chain token allocation',
      status: simulationStep >= 1 ? (simulationStep > 1 ? 'success' : 'running') : 'idle',
      icon: Sparkles,
      color: 'purple',
    },
    {
      id: 'chain',
      type: 'chain',
      label: 'Polygon Ledger Transaction',
      desc: 'Mints and logs block confirmation',
      status: simulationStep >= 2 ? (simulationStep > 2 ? 'success' : 'running') : 'idle',
      icon: ShieldCheck,
      color: 'emerald',
    },
    {
      id: 'notify',
      type: 'notification',
      label: `${parsedChannel.toUpperCase()} Notification`,
      desc: `Sends automated event webhook receipt`,
      status: simulationStep >= 3 ? 'success' : 'idle',
      icon: Bell,
      color: parsedChannel === 'discord' ? 'violet' : parsedChannel === 'slack' ? 'pink' : 'amber',
    },
  ];

  const startSimulation = async () => {
    // Check if any policy check is failing
    const hasFailingPolicy = policyChecks.some(p => p.status === 'fail');
    if (hasFailingPolicy) {
      toast.error('Cannot run workflow. Safety policy checks are failing!');
      return;
    }

    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(0);
    
    const steps = [0, 1, 2, 3];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSimulationStep(i + 1);
    }

    if (executionMode === 'deploy') {
      // Add transaction representing deployment payout on live mode simulation
      const generatedHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      addTransaction({
        wallet: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        amount: parsedAmount,
        txHash: generatedHash,
        timestamp: new Date().toISOString(),
        type: 'reward',
      });
      incrementApiCalls();
      toast.success('Rule actively deployed to Relayer Nodes! Live transactions processed.', { icon: '🚀' });
    } else {
      toast.success('Dry Run Simulation Successful! No transactions written to ledger.');
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#3b82f6', '#a855f7', '#10b981'],
    });

    setIsSimulating(false);
  };

  const generatedCodes = {
    json: `{
  "name": "AI Generated Rule",
  "intent": "${intentClass}",
  "trigger": "${parsedTrigger}",
  "actions": [
    {
      "type": "reward_user",
      "params": {
        "amount": ${parsedAmount},
        "currency": "SHARP"
      }
    },
    {
      "type": "dispatch_webhook",
      "params": {
        "channel": "${parsedChannel}",
        "url": "https://api.sharpflow.ai/webhooks/trigger"
      }
    }
  ],
  "security": {
    "policy_checks": ${JSON.stringify(policyChecks.map(p => ({ id: p.id, status: p.status })), null, 2).replace(/\n/g, '\n    ')}
  }
}`,
    node: `// Node.js Express endpoint integration
const { SharpFlow } = require('@sharpflow/sdk');
const sharpflow = new SharpFlow({ apiKey: 'sf_live_...' });

app.post('/events/${parsedTrigger}', async (req, res) => {
  const { userWallet } = req.body;
  
  try {
    // 1. Reward user with SHARP tokens
    const tx = await sharpflow.rewardUser(userWallet, ${parsedAmount});
    
    // 2. Alert Webhook notification channel
    await sharpflow.triggerWebhook({
      channel: '${parsedChannel}',
      message: \`User \${userWallet.slice(0,6)}... rewarded ${parsedAmount} SHARP for ${parsedTrigger.replace('_', ' ')}!\`
    });

    res.json({ success: true, txHash: tx.txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`,
    python: `# Python Flask controller
from sharpflow import SharpFlow
client = SharpFlow(api_key='sf_live_...')

@app.route('/events/${parsedTrigger}', methods=['POST'])
def handle_event():
    data = request.json
    wallet = data['userWallet']
    
    try:
        # 1. Dispatch tokens
        tx = client.reward_user(wallet=wallet, amount=${parsedAmount})
        
        # 2. Dispatch webhook
        client.trigger_webhook(
            channel='${parsedChannel}',
            message=f"Rewarded ${parsedAmount} SHARP for ${parsedTrigger.replace('_', ' ')}!"
        )
        return {"success": True, "txHash": tx['txHash']}
    except Exception as e:
        return {"error": str(e)}, 500`,
    webhook: `{
  "event": "reward.sent",
  "webhook_target": "${parsedChannel}",
  "payload": {
    "trigger_source": "${parsedTrigger}",
    "wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": ${parsedAmount},
    "token": "SHARP",
    "network": "Polygon Amoy",
    "timestamp": "${new Date().toISOString()}"
  }
}`
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(generatedCodes[activeCodeTab]);
    setCopied(true);
    toast.success('Code snippet copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            <span>AI Rule Orchestration Canvas</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Compose on-chain automated rules using natural language. The LLM parses user intents, compiles JSON models, and checks security policies before deployment.
          </p>
        </div>
      </div>

      {/* NLP Prompt Box */}
      <form onSubmit={handlePromptSubmit} className="space-y-3">
        <div className="flex flex-col sm:relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Reward users with 100 SHARP tokens when checkout completed and notify Slack."
            className="w-full pl-4 pr-4 sm:pr-36 py-3 bg-zinc-950/50 border border-white/[0.08] rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[88px] sm:min-h-[72px] resize-none"
          />
          <button
            type="submit"
            disabled={isParsing || !prompt}
            className="mt-2 sm:mt-0 sm:absolute sm:right-3 sm:bottom-3.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isParsing ? 'Processing LLM...' : 'Compile Rules'}</span>
          </button>
        </div>
        
        {/* Suggestion Pills */}
        <div className="flex flex-wrap gap-2">
          {suggestionPrompts.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(s)}
              className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-[10px] text-zinc-400 hover:text-white transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {/* Main Grid: Interactive Canvas & Generated Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Col: Interactive Canvas Diagram */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <GlassCard className="p-6 flex-1 flex flex-col justify-between relative overflow-hidden bg-zinc-900/20 border-white/[0.06] min-h-[440px]">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 grid-canvas-overlay opacity-20 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 mb-6 w-full">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
                Active Execution Flow
              </span>
              
              {/* Execution Options and trigger button */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex bg-zinc-950 border border-white/[0.08] p-0.5 rounded-lg text-2xs font-mono shrink-0">
                  <button
                    type="button"
                    onClick={() => setExecutionMode('dry_run')}
                    className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                      executionMode === 'dry_run' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500'
                    }`}
                  >
                    <Eye className="h-3 w-3" />
                    Dry Run
                  </button>
                  <button
                    type="button"
                    onClick={() => setExecutionMode('deploy')}
                    className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                      executionMode === 'deploy' ? 'bg-purple-900/30 text-purple-400 font-bold border border-purple-500/20' : 'text-zinc-500'
                    }`}
                  >
                    <Rocket className="h-3 w-3" />
                    Active Deploy
                  </button>
                </div>

                <button
                  type="button"
                  onClick={startSimulation}
                  disabled={isSimulating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-zinc-950 text-2xs font-extrabold uppercase rounded-lg hover:scale-[1.03] active:scale-[0.97] transition-all disabled:opacity-45 shrink-0"
                >
                  <Play className="h-3 w-3 fill-current" />
                  <span>{isSimulating ? 'Running...' : executionMode === 'deploy' ? 'Deploy Rule' : 'Simulate'}</span>
                </button>
              </div>
            </div>

            {/* Visual Canvas Diagram Area */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-5 py-4 z-10 relative">
              {nodes.map((node, index) => {
                const Icon = node.icon;
                const showCheck = node.status === 'success';
                const showPulse = node.status === 'running';

                return (
                  <React.Fragment key={node.id}>
                    {/* Node Card */}
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative w-full max-w-[280px] sm:w-72 rounded-2xl border px-4 py-3.5 text-left flex items-center justify-between gap-3 shadow-lg select-none ${
                        showCheck
                          ? 'bg-zinc-900 border-emerald-500/30 shadow-emerald-500/5'
                          : showPulse
                          ? 'bg-zinc-900 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                          : 'bg-zinc-900/60 border-white/[0.06]'
                      }`}
                    >
                      {/* Left accent line */}
                      <span className={`absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r-md bg-${node.color}-500`} />

                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-xl bg-${node.color}-500/10 text-${node.color}-400 flex items-center justify-center border border-${node.color}-500/20`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-extrabold text-white tracking-tight leading-none mb-0.5">{node.label}</h4>
                          <p className="text-[10px] text-zinc-500 leading-normal">{node.desc}</p>
                        </div>
                      </div>

                      {/* Status marker */}
                      <div className="shrink-0">
                        {showCheck ? (
                          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                        ) : showPulse ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 block" />
                        )}
                      </div>
                    </motion.div>

                    {/* Vertical Connector Line with animation packet */}
                    {index < nodes.length - 1 && (
                      <div className="h-5 w-0.5 bg-zinc-800 relative">
                        {/* Glowing packet animation */}
                        {simulationStep === index && (
                          <motion.div
                            initial={{ top: '-10%' }}
                            animate={{ top: '110%' }}
                            transition={{ duration: 0.9, ease: 'easeInOut', repeat: Infinity }}
                            className="absolute left-[-3px] w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] z-25"
                          />
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </GlassCard>

          {/* AI Layer & Active Policies Panel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Confidence & Intent Metrics */}
            <GlassCard className="p-5 border border-white/[0.08] bg-white/[0.02] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-1.5">
                  <BadgeInfo className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">AI Classification Metrics</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Active Model
                </span>
              </div>

              <div className="space-y-3 font-mono text-[10px] text-zinc-400">
                <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg">
                  <span className="text-zinc-500">Intent Label:</span>
                  <span className="text-white font-bold">{intentClass}</span>
                </div>
                <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded-lg">
                  <span className="text-zinc-500">Classification Confidence:</span>
                  <span className="text-emerald-400 font-bold">{Math.round(intentConfidence * 100)}%</span>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Entity Extraction Logs</span>
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    {extractions.map((item, idx) => (
                      <div key={idx} className="bg-white/[0.01] border border-white/[0.04] p-2 rounded-lg space-y-1">
                        <span className="text-zinc-500 block text-[8px] uppercase tracking-wider">{item.key}</span>
                        <div className="flex justify-between items-center">
                          <span className="text-white truncate font-bold">{item.value}</span>
                          <span className="text-emerald-400 font-bold">{Math.round(item.confidence * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Policy Validation Layer */}
            <GlassCard className="p-5 border border-white/[0.08] bg-white/[0.02] space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Policy Validation Layer</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase font-mono flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Audited
                </span>
              </div>

              <div className="space-y-3">
                {policyChecks.map((policy) => (
                  <div key={policy.id} className="flex gap-2.5 items-start">
                    <div className="mt-0.5 shrink-0">
                      {policy.status === 'pass' ? (
                        <div className="h-4 w-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Check className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                          <AlertCircle className="h-3 w-3 animate-bounce" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <span className={`text-[11px] font-bold block ${policy.status === 'fail' ? 'text-red-400' : 'text-zinc-300'}`}>
                        {policy.name}
                      </span>
                      <span className="text-[9px] text-zinc-500 block leading-tight">
                        {policy.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>
        </div>

        {/* Right Col: Code Generator Tabs */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex flex-col bg-zinc-950 rounded-2xl border border-zinc-900 shadow-2xl overflow-hidden flex-1 min-h-[350px]">
            {/* Headers */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-900/40">
              <div className="flex items-center gap-1.5">
                <Code2 className="h-4.5 w-4.5 text-purple-400" />
                <span className="text-xs font-semibold text-zinc-200">Generated Rules</span>
              </div>
              <button
                type="button"
                onClick={copyCodeToClipboard}
                className="text-2xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 transition-all"
              >
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Code Tabs Selector */}
            <div className="flex bg-zinc-900 border-b border-zinc-900/60 p-1 gap-1 text-2xs">
              <button
                onClick={() => setActiveCodeTab('json')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  activeCodeTab === 'json' ? 'bg-zinc-850 text-white' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Schema
              </button>
              <button
                onClick={() => setActiveCodeTab('node')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  activeCodeTab === 'node' ? 'bg-zinc-850 text-white' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Node
              </button>
              <button
                onClick={() => setActiveCodeTab('python')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  activeCodeTab === 'python' ? 'bg-zinc-850 text-white' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveCodeTab('webhook')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  activeCodeTab === 'webhook' ? 'bg-zinc-850 text-white' : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                Webhook
              </button>
            </div>

            {/* Snippet Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              <pre className="text-zinc-300 font-mono text-[10px] leading-relaxed break-all whitespace-pre-wrap">
                <code className="text-blue-400">{generatedCodes[activeCodeTab]}</code>
              </pre>
            </div>
          </div>
          
          {/* Active Relayer Dispatch Details */}
          <GlassCard className="p-5 border border-white/[0.08] bg-white/[0.03] space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
              Runtime Relayer Dispatcher
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              When triggered in active mode, the rule dispatches transaction hashes via a gas-sponsored Polygon Relayer node.
            </p>
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 text-[10px] font-mono space-y-2 text-zinc-400">
              <div className="flex justify-between">
                <span>Relayer Node IP:</span>
                <span className="text-white">162.254.204.18</span>
              </div>
              <div className="flex justify-between">
                <span>Sponsor Address:</span>
                <span className="text-purple-400 truncate max-w-[120px]">0x3B...8A9D</span>
              </div>
              <div className="flex justify-between">
                <span>Relay Gas Cost:</span>
                <span className="text-emerald-400">0.00 Gwei (Sponsored)</span>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
