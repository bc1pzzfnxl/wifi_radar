import React, { useState } from 'react';
import { MessageSquare, Check, Copy, X } from 'lucide-react';

interface FeedbackItem {
  id: string;
  variant: string;
  element: string;
  comment: string;
}

interface FeedbackOverlayProps {
  targetName: string;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ targetName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeVariant, setActiveVariant] = useState('Variant A');
  const [elementDesc, setElementDesc] = useState('');
  const [commentText, setCommentText] = useState('');
  const [overallDirection, setOverallDirection] = useState('');
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [copied, setCopied] = useState(false);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newItem: FeedbackItem = {
      id: Math.random().toString(36).substring(2, 9),
      variant: activeVariant,
      element: elementDesc.trim() || 'General Component',
      comment: commentText.trim()
    };
    setFeedbackList((prev) => [...prev, newItem]);
    setElementDesc('');
    setCommentText('');
  };

  const handleRemove = (id: string) => {
    setFeedbackList((prev) => prev.filter((item) => item.id !== id));
  };

  const generateMarkdown = () => {
    const lines: string[] = [];
    lines.push(`## Design Lab Feedback\n`);
    lines.push(`**Target:** ${targetName}`);
    lines.push(`**Comments:** ${feedbackList.length}\n`);

    const variants = ['Variant A', 'Variant B', 'Variant C', 'Variant D', 'Variant E'];
    variants.forEach((v) => {
      const items = feedbackList.filter((f) => f.variant === v);
      if (items.length > 0) {
        lines.push(`### ${v}`);
        items.forEach((item, idx) => {
          lines.push(`${idx + 1}. **${item.element}**\n   "${item.comment}"`);
        });
        lines.push('');
      }
    });

    lines.push(`### Overall Direction`);
    lines.push(overallDirection.trim() || 'No overall notes provided.');
    return lines.join('\n');
  };

  const handleCopy = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-full shadow-lg hover:bg-zinc-800 transition-all text-xs font-medium cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Add Feedback ({feedbackList.length})</span>
        </button>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-2xl w-96 max-h-[85vh] flex flex-col overflow-hidden text-xs text-zinc-900">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/70">
            <div className="flex items-center gap-2 font-semibold text-zinc-900">
              <MessageSquare className="w-4 h-4 text-zinc-700" />
              <span>Design Lab Feedback</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            <div>
              <label className="block text-zinc-500 font-medium mb-1">Target Variant</label>
              <div className="grid grid-cols-5 gap-1">
                {['Variant A', 'Variant B', 'Variant C', 'Variant D', 'Variant E'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setActiveVariant(v)}
                    className={`py-1 rounded text-[11px] font-medium border transition-all cursor-pointer ${
                      activeVariant === v
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    {v.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-zinc-500 font-medium mb-1">Element (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Scope Rings, Channel Buttons, Cards..."
                value={elementDesc}
                onChange={(e) => setElementDesc(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-zinc-500 font-medium mb-1">Feedback / Comment</label>
              <textarea
                placeholder="Describe what to keep, remove, or improve..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900 resize-none"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="mt-1.5 w-full bg-zinc-900 text-white py-1.5 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                Add Note
              </button>
            </div>

            {feedbackList.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-100">
                <div className="text-[11px] font-semibold text-zinc-700">Collected Notes ({feedbackList.length})</div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {feedbackList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-2 text-[11px] flex justify-between items-start gap-2"
                    >
                      <div>
                        <span className="font-semibold text-zinc-900">{item.variant}</span> · <span className="text-zinc-500">{item.element}</span>
                        <div className="text-zinc-700 mt-0.5">{item.comment}</div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-zinc-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-100">
              <label className="block text-zinc-500 font-medium mb-1">Overall Direction</label>
              <textarea
                placeholder="Summarize your final choice or which parts to synthesize..."
                value={overallDirection}
                onChange={(e) => setOverallDirection(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:border-zinc-900 resize-none"
              />
            </div>
          </div>

          <div className="p-3 border-t border-zinc-100 bg-zinc-50/70">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-1.5 bg-zinc-900 text-white py-2 rounded-xl font-medium hover:bg-zinc-800 transition-all cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Feedback!' : 'Copy Feedback to Clipboard'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
