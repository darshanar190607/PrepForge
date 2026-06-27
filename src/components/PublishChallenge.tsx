import React, { useState } from 'react';
import { Problem, Difficulty, Resource, TestCase } from '../types';
import { 
  Sparkles, 
  X, 
  Plus, 
  Trash2, 
  Code2, 
  FileCode, 
  Send,
  HelpCircle,
  FolderOpen
} from 'lucide-react';

interface PublishChallengeProps {
  onPublish: (problem: Problem) => void;
  onClose: () => void;
}

// Convenient presets to make testing fast!
const LEETCODE_PRESETS = [
  {
    title: 'Valid Anagram',
    topic: 'Arrays & Hashing',
    pattern: 'Frequency Map / Sorting',
    difficulty: 'Easy' as Difficulty,
    description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.\n\n### Example 1:\n```\nInput: s = "anagram", t = "nagaram"\nOutput: true\n```',
    companyTags: ['Amazon', 'Uber', 'Spotify'],
    resources: 'Valid Anagram on LeetCode|https://leetcode.com/problems/valid-anagram/'
  },
  {
    title: 'Binary Search',
    topic: 'Binary Search',
    pattern: 'Divide and Conquer',
    difficulty: 'Easy' as Difficulty,
    description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`.\n\nIf `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.\n\n### Example 1:\n```\nInput: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\n```',
    companyTags: ['Google', 'Microsoft', 'Apple'],
    resources: 'Binary Search Video Tutorial|https://neetcode.io/practice'
  },
  {
    title: 'Validate Binary Search Tree',
    topic: 'Trees',
    pattern: 'DFS / Post-order Traversal',
    difficulty: 'Medium' as Difficulty,
    description: 'Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys less than the node\'s key.\n- The right subtree of a node contains only nodes with keys greater than the node\'s key.\n- Both the left and right subtrees must also be binary search trees.\n\n### Example 1:\n```\nInput: root = [2,1,3]\nOutput: true\n```',
    companyTags: ['Bloomberg', 'Facebook', 'Goldman Sachs'],
    resources: 'Validate BST - LeetCode 98|https://leetcode.com/problems/validate-binary-search-tree/'
  }
];

export default function PublishChallenge({ onPublish, onClose }: PublishChallengeProps) {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Arrays & Hashing');
  const [pattern, setPattern] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [deadline, setDeadline] = useState('2026-06-30');
  const [description, setDescription] = useState('');
  const [companyTagsInput, setCompanyTagsInput] = useState('');
  
  // Resources state
  const [resources, setResources] = useState<Resource[]>([
    { name: 'LeetCode Problem Link', url: 'https://leetcode.com/' }
  ]);

  // Test cases state
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', output: '' }
  ]);

  // Python, JS, C++, Java starter codes
  const [pyCode, setPyCode] = useState('def solution():\n    # Write your code here\n    pass');
  const [jsCode, setJsCode] = useState('function solution() {\n    // Write your code here\n}');
  const [cppCode, setCppCode] = useState('class Solution {\npublic:\n    void solution() {\n        // Write your code here\n    }\n};');
  const [javaCode, setJavaCode] = useState('class Solution {\n    public void solution() {\n        // Write your code here\n    }\n}');

  // Handle Preset Load
  const handleLoadPreset = (preset: typeof LEETCODE_PRESETS[0]) => {
    setTitle(preset.title);
    setTopic(preset.topic);
    setPattern(preset.pattern);
    setDifficulty(preset.difficulty);
    setDescription(preset.description);
    setCompanyTagsInput(preset.companyTags.join(', '));
    
    const parts = preset.resources.split('|');
    setResources([{ name: parts[0], url: parts[1] }]);
    setTestCases([
      { input: 'nums = [1,2,3], target = 3', output: 'true' }
    ]);

    // Update templates based on title
    const formattedTitle = preset.title.charAt(0).toLowerCase() + preset.title.slice(1).replace(/\s+/g, '');
    setPyCode(`def ${formattedTitle}(self, *args, **kwargs):\n    # Write code here\n    pass`);
    setJsCode(`function ${formattedTitle}() {\n    // Write code here\n}`);
    setCppCode(`class Solution {\npublic:\n    bool ${formattedTitle}() {\n        // Write code here\n        return true;\n    }\n};`);
    setJavaCode(`class Solution {\n    public boolean ${formattedTitle}() {\n        // Write code here\n        return true;\n    }\n}`);
  };

  const handleAddResource = () => {
    setResources([...resources, { name: '', url: '' }]);
  };

  const handleRemoveResource = (index: number) => {
    setResources(resources.filter((_, idx) => idx !== index));
  };

  const handleResourceChange = (index: number, field: 'name' | 'url', value: string) => {
    const nextRes = [...resources];
    nextRes[index][field] = value;
    setResources(nextRes);
  };

  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', output: '' }]);
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, idx) => idx !== index));
  };

  const handleTestCaseChange = (index: number, field: 'input' | 'output', value: string) => {
    const nextTc = [...testCases];
    nextTc[index][field] = value;
    setTestCases(nextTc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !pattern) {
      alert('Please fill out Title, Pattern, and Description.');
      return;
    }

    const problem: Problem = {
      id: `prob-${Date.now()}`,
      title,
      description,
      topic,
      pattern,
      difficulty,
      deadline,
      companyTags: companyTagsInput.split(',').map(tag => tag.trim()).filter(Boolean),
      publishedAt: new Date().toISOString(),
      resources: resources.filter(r => r.name.trim() && r.url.trim()),
      testCases: testCases.filter(tc => tc.input.trim() && tc.output.trim()),
      starterCode: {
        python: pyCode,
        javascript: jsCode,
        cpp: cppCode,
        java: javaCode
      }
    };

    onPublish(problem);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6" id="publish-challenge-form-container">
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4" id="form-header">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-550 animate-pulse" size={20} />
          <h2 className="text-base font-bold text-slate-850">Create Daily Placement Challenge</h2>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer" id="close-publish-btn">
          <X size={18} />
        </button>
      </div>

      {/* Preset bar */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200" id="preset-selector-bar">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
          <FolderOpen size={13} className="text-indigo-600" />
          Quick Preset Auto-Fill:
        </span>
        <div className="flex flex-wrap gap-2">
          {LEETCODE_PRESETS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleLoadPreset(preset)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-150 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              + {preset.title} ({preset.difficulty})
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" id="publish-form">
        {/* Core details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Challenge Title</label>
            <input
              type="text"
              placeholder="e.g. Valid Parentheses"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
              required
              id="challenge-title-input"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Topic Category</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-lg text-xs outline-none cursor-pointer focus:border-indigo-500 focus:bg-white"
              id="challenge-topic-select"
            >
              <option value="Arrays & Hashing">Arrays & Hashing</option>
              <option value="Two Pointers">Two Pointers</option>
              <option value="Sliding Window">Sliding Window</option>
              <option value="Trees">Trees</option>
              <option value="Graphs">Graphs</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Intervals">Intervals</option>
              <option value="Binary Search">Binary Search</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Coding Pattern</label>
            <input
              type="text"
              placeholder="e.g. Frequency Map, DFS, Sliding Window"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
              required
              id="challenge-pattern-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-lg text-xs outline-none cursor-pointer focus:border-indigo-500 focus:bg-white"
                id="challenge-difficulty-select"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
                required
                id="challenge-deadline-input"
              />
            </div>
          </div>
        </div>

        {/* Company Tags */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            Company Tags <span className="text-slate-400 font-normal lowercase italic">(comma-separated)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Google, Amazon, Microsoft, Goldman Sachs"
            value={companyTagsInput}
            onChange={(e) => setCompanyTagsInput(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
            id="challenge-companies-input"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Problem Description (Supports Markdown)</label>
          <textarea
            rows={4}
            placeholder="Describe the task, edge cases, examples, constraints..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-lg text-xs outline-none font-mono focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
            required
            id="challenge-desc-textarea"
          />
        </div>

        {/* Resources Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preparation Resources / Cheat Sheets</span>
            <button
              type="button"
              onClick={handleAddResource}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <Plus size={12} /> Add Resource
            </button>
          </div>
          <div className="space-y-2">
            {resources.map((res, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="e.g. Solution Walkthrough Video"
                  value={res.name}
                  onChange={(e) => handleResourceChange(index, 'name', e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 py-2 px-3 rounded-lg text-xs flex-1 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
                />
                <input
                  type="text"
                  placeholder="e.g. https://youtube.com/watch?v=..."
                  value={res.url}
                  onChange={(e) => handleResourceChange(index, 'url', e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 py-2 px-3 rounded-lg text-xs flex-2 outline-none focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
                />
                {resources.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(index)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Test cases Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verification Test Cases</span>
            <button
              type="button"
              onClick={handleAddTestCase}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              <Plus size={12} /> Add Test Case
            </button>
          </div>
          <div className="space-y-2">
            {testCases.map((tc, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Input: nums = [1,2], target = 3"
                  value={tc.input}
                  onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-850 py-2 px-3 rounded-lg text-xs flex-1 outline-none font-mono focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
                />
                <input
                  type="text"
                  placeholder="Expected Output: [0,1]"
                  value={tc.output}
                  onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-850 py-2 px-3 rounded-lg text-xs flex-1 outline-none font-mono focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition"
                />
                {testCases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTestCase(index)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Starter Codes Accordion */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 size={14} className="text-indigo-600" /> Starter Code Templates
          </span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-1">Python Starter Code</span>
              <textarea
                rows={3}
                value={pyCode}
                onChange={(e) => setPyCode(e.target.value)}
                className="w-full bg-[#141416] border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-1">JavaScript Starter Code</span>
              <textarea
                rows={3}
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                className="w-full bg-[#141416] border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-1">C++ Starter Code</span>
              <textarea
                rows={3}
                value={cppCode}
                onChange={(e) => setCppCode(e.target.value)}
                className="w-full bg-[#141416] border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-1">Java Starter Code</span>
              <textarea
                rows={3}
                value={javaCode}
                onChange={(e) => setJavaCode(e.target.value)}
                className="w-full bg-[#141416] border border-slate-800 text-slate-200 p-2 rounded-lg text-xs font-mono outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4" id="publish-actions">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-600/10"
            id="submit-new-challenge-btn"
          >
            <Send size={12} />
            <span>Publish Challenge</span>
          </button>
        </div>
      </form>
    </div>
  );
}
