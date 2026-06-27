import { User, Problem, Submission, Announcement, Notification } from './types';

export const mockUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Rahul Verma',
    email: 'rahul.verma@college.edu',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    streak: 24,
    solvedCount: 48,
    joinDate: '2026-03-15',
    status: 'active',
  },
  {
    id: 'user-priya',
    name: 'Priya Patel',
    email: 'priya.patel@student.edu',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    streak: 18,
    solvedCount: 42,
    joinDate: '2026-04-01',
    status: 'active',
  },
  {
    id: 'user-aman',
    name: 'Aman Sharma',
    email: 'aman.sharma@student.edu',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    streak: 12,
    solvedCount: 38,
    joinDate: '2026-04-02',
    status: 'active',
  },
  {
    id: 'user-vikram',
    name: 'Vikram Malhotra',
    email: 'vikram.m@student.edu',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    streak: 8,
    solvedCount: 30,
    joinDate: '2026-04-05',
    status: 'active',
  },
  {
    id: 'user-sneha',
    name: 'Sneha Reddy',
    email: 'sneha.r@student.edu',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    streak: 15,
    solvedCount: 35,
    joinDate: '2026-04-10',
    status: 'active',
  },
  {
    id: 'user-devendra',
    name: 'Devendra Singh',
    email: 'dev.singh@student.edu',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    streak: 0,
    solvedCount: 0,
    joinDate: '2026-06-24',
    status: 'pending', // Joining request waiting for approval
  },
  {
    id: 'user-ananya',
    name: 'Ananya Sen',
    email: 'ananya.s@student.edu',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    streak: 0,
    solvedCount: 0,
    joinDate: '2026-06-25',
    status: 'pending',
  }
];

export const mockProblems: Problem[] = [
  {
    id: 'prob-1',
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n### Example 1:\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```',
    topic: 'Arrays & Hashing',
    pattern: 'Two Pointers / Hash Map',
    difficulty: 'Easy',
    deadline: '2026-06-20',
    companyTags: ['Amazon', 'Google', 'Adobe', 'Meta'],
    publishedAt: '2026-06-19T09:00:00Z',
    resources: [
      { name: 'LeetCode 1 - Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
      { name: 'NeetCode Solution Video', url: 'https://www.youtube.com/watch?v=KLlXCFG5TkA' }
    ],
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    starterCode: {
      python: `def twoSum(nums: list[int], target: int) -> list[int]:\n    # Write your code here\n    pass`,
      javascript: `function twoSum(nums, target) {\n    // Write your code here\n    return [];\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[0];\n    }\n}`
    }
  },
  {
    id: 'prob-2',
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.\n\n### Example 1:\n```\nInput: s = "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.\n```\n\n### Example 2:\n```\nInput: s = "bbbbb"\nOutput: 1\nExplanation: The answer is "b", with the length of 1.\n```',
    topic: 'Sliding Window',
    pattern: 'Sliding Window / Set',
    difficulty: 'Medium',
    deadline: '2026-06-22',
    companyTags: ['Amazon', 'Microsoft', 'Bloomberg', 'Uber'],
    publishedAt: '2026-06-21T09:00:00Z',
    resources: [
      { name: 'LeetCode 3 - Longest Substring', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { name: 'Sliding Window Pattern Guide', url: 'https://neetcode.io/practice' }
    ],
    testCases: [
      { input: 's = "abcabcbb"', output: '3' },
      { input: 's = "pwwkew"', output: '3' }
    ],
    starterCode: {
      python: `def lengthOfLongestSubstring(s: str) -> int:\n    # Write your code here\n    pass`,
      javascript: `function lengthOfLongestSubstring(s) {\n    // Write your code here\n    return 0;\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your code here\n        return 0;\n    }\n};`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}`
    }
  },
  {
    id: 'prob-3',
    title: 'Merge Intervals',
    description: 'Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\n\n### Example 1:\n```\nInput: intervals = [[1,3],[2,6],[8,10],[15,18]]\nOutput: [[1,6],[8,10],[15,18]]\nExplanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].\n```',
    topic: 'Intervals',
    pattern: 'Sorting / Linear Scan',
    difficulty: 'Medium',
    deadline: '2026-06-24',
    companyTags: ['Google', 'Meta', 'Salesforce', 'Microsoft'],
    publishedAt: '2026-06-23T09:00:00Z',
    resources: [
      { name: 'LeetCode 56 - Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/' }
    ],
    testCases: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' }
    ],
    starterCode: {
      python: `def merge(intervals: list[list[int]]) -> list[list[int]]:\n    # Write your code here\n    pass`,
      javascript: `function merge(intervals) {\n    // Write your code here\n    return [];\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write your code here\n        return {};\n    }\n};`,
      java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write your code here\n        return new int[0][0];\n    }\n}`
    }
  },
  {
    id: 'prob-4',
    title: 'Invert Binary Tree',
    description: 'Given the `root` of a binary tree, invert the tree, and return its root.\n\n### Example 1:\n```\nInput: root = [4,2,7,1,3,6,9]\nOutput: [4,7,2,9,6,3,1]\n```',
    topic: 'Trees',
    pattern: 'DFS / BFS / Recursion',
    difficulty: 'Easy',
    deadline: '2026-06-25',
    companyTags: ['Google', 'Amazon', 'Apple'],
    publishedAt: '2026-06-25T09:00:00Z', // TODAY'S CHALLENGE
    resources: [
      { name: 'LeetCode 226 - Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/' }
    ],
    testCases: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' }
    ],
    starterCode: {
      python: `# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         this.val = val\n#         this.left = left\n#         this.right = right\n\ndef invertTree(root: Optional[TreeNode]) -> Optional[TreeNode]:\n    # Write your code here\n    pass`,
      javascript: `function invertTree(root) {\n    // Write your code here\n    return root;\n}`,
      cpp: `class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        // Write your code here\n        return root;\n    }\n};`,
      java: `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Write your code here\n        return root;\n    }\n}`
    }
  }
];

export const mockSubmissions: Submission[] = [
  // Two Sum Solutions (Easy)
  {
    id: 'sub-1',
    problemId: 'prob-1',
    userId: 'user-priya',
    userName: 'Priya Patel',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    language: 'java',
    code: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
    status: 'Accepted',
    submittedAt: '2026-06-19T14:23:00Z',
    runtime: '1 ms',
    memory: '42.8 MB',
    explanation: 'One-pass hash map solution. We traverse the list once, look up the complement in the hash table, and return the matched pair. Space complexity is O(N) and time is O(N).'
  },
  {
    id: 'sub-2',
    problemId: 'prob-1',
    userId: 'user-aman',
    userName: 'Aman Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    language: 'python',
    code: `def twoSum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for idx, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], idx]\n        seen[num] = idx\n    return []`,
    status: 'Accepted',
    submittedAt: '2026-06-19T15:10:00Z',
    runtime: '38 ms',
    memory: '15.2 MB',
    explanation: 'Standard dictionary lookup in Python. It runs in O(N) time and O(N) space. Very readable.'
  },
  {
    id: 'sub-3',
    problemId: 'prob-1',
    userId: 'user-vikram',
    userName: 'Vikram Malhotra',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    language: 'cpp',
    code: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        for (int i = 0; i < nums.size(); ++i) {\n            for (int j = i + 1; j < nums.size(); ++j) {\n                if (nums[i] + nums[j] == target) {\n                    return {i, j};\n                }\n            }\n        }\n        return {};\n    }\n};`,
    status: 'Accepted',
    submittedAt: '2026-06-19T18:45:00Z',
    runtime: '124 ms',
    memory: '10.1 MB',
    explanation: 'Brute force double nested loop. O(N^2) time, but uses O(1) extra space because it does not require a hash table.'
  },

  // Longest Substring Solutions (Medium)
  {
    id: 'sub-4',
    problemId: 'prob-2',
    userId: 'user-priya',
    userName: 'Priya Patel',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    language: 'java',
    code: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        int n = s.length();\n        int maxLength = 0;\n        int[] charIndex = new int[128]; // ASCII array to track last seen positions\n        Arrays.fill(charIndex, -1);\n        \n        int left = 0;\n        for (int right = 0; right < n; right++) {\n            char cur = s.charAt(right);\n            if (charIndex[cur] >= left) {\n                left = charIndex[cur] + 1;\n            }\n            charIndex[cur] = right;\n            maxLength = Math.max(maxLength, right - left + 1);\n        }\n        return maxLength;\n    }\n}`,
    status: 'Accepted',
    submittedAt: '2026-06-21T11:05:00Z',
    runtime: '2 ms',
    memory: '41.5 MB',
    explanation: 'Highly optimized sliding window using a fixed ASCII integer array instead of standard HashMap. Skips left directly when a duplicate is found, reducing time to single linear scan.'
  },
  {
    id: 'sub-5',
    problemId: 'prob-2',
    userId: 'user-aman',
    userName: 'Aman Sharma',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    language: 'python',
    code: `def lengthOfLongestSubstring(s: str) -> int:\n    char_set = set()\n    left = 0\n    max_len = 0\n    \n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n        \n    return max_len`,
    status: 'Accepted',
    submittedAt: '2026-06-21T12:30:00Z',
    runtime: '55 ms',
    memory: '14.8 MB',
    explanation: 'Classic sliding window with a set in Python. Expand the window to the right, and if we encounter a repeating character, contract from the left until the duplicate is gone.'
  },
  {
    id: 'sub-6',
    problemId: 'prob-2',
    userId: 'user-sneha',
    userName: 'Sneha Reddy',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    language: 'javascript',
    code: `function lengthOfLongestSubstring(s) {\n    const map = new Map();\n    let maxLen = 0;\n    let left = 0;\n    \n    for (let right = 0; right < s.length; right++) {\n        const char = s[right];\n        if (map.has(char) && map.get(char) >= left) {\n            left = map.get(char) + 1;\n        }\n        map.set(char, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    \n    return maxLen;\n}`,
    status: 'Accepted',
    submittedAt: '2026-06-21T16:15:00Z',
    runtime: '72 ms',
    memory: '44.3 MB',
    explanation: 'Sliding window in JavaScript using ES6 Map. Tracks indices of characters to shift the left bound immediately.'
  },

  // Merge Intervals (Medium)
  {
    id: 'sub-7',
    problemId: 'prob-3',
    userId: 'user-priya',
    userName: 'Priya Patel',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    language: 'python',
    code: `def merge(intervals: list[list[int]]) -> list[list[int]]:\n    if not intervals:\n        return []\n    \n    # Sort intervals based on start times\n    intervals.sort(key=lambda x: x[0])\n    \n    merged = [intervals[0]]\n    for current in intervals[1:]:\n        prev = merged[-1]\n        \n        # If overlapping, merge by updating end time of previous\n        if current[0] <= prev[1]:\n            prev[1] = max(prev[1], current[1])\n        else:\n            merged.append(current)\n            \n    return merged`,
    status: 'Accepted',
    submittedAt: '2026-06-23T14:40:00Z',
    runtime: '78 ms',
    memory: '18.4 MB',
    explanation: 'Sort-based interval check. Sorting takes O(N log N) and linear scanning takes O(N). This is optimal since we must verify bounds.'
  },
  {
    id: 'sub-8',
    problemId: 'prob-3',
    userId: 'user-vikram',
    userName: 'Vikram Malhotra',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    language: 'cpp',
    code: `class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        if (intervals.empty()) return {};\n        sort(intervals.begin(), intervals.end());\n        \n        vector<vector<int>> merged;\n        merged.push_back(intervals[0]);\n        \n        for (int i = 1; i < intervals.size(); ++i) {\n            if (intervals[i][0] <= merged.back()[1]) {\n                merged.back()[1] = max(merged.back()[1], intervals[i][1]);\n            } else {\n                merged.push_back(intervals[i]);\n            }\n        }\n        return merged;\n    }\n};`,
    status: 'Accepted',
    submittedAt: '2026-06-23T20:10:00Z',
    runtime: '18 ms',
    memory: '14.2 MB',
    explanation: 'C++ STL sort with custom lambda (default vector sort works too). Linear check using std::vector back access.'
  }
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Upcoming Mock Technical Interviews',
    content: 'Hi Team, we have scheduled mock technical interviews starting next Monday. We will focus heavily on arrays, trees, and system design. Please keep your consistency high. We will have guest evaluators from Amazon & Google!',
    author: 'Rahul Verma (Admin)',
    createdAt: '2026-06-24T10:00:00Z',
    category: 'important'
  },
  {
    id: 'ann-2',
    title: 'Resources for Dynamic Programming',
    content: 'I have uploaded a DP cheat-sheet under the resource tab. It contains the 5 key patterns (0/1 Knapsack, Unbounded, LCS, LIS, Interval DP). Highly recommend revising this before our major tests next month.',
    author: 'Rahul Verma (Admin)',
    createdAt: '2026-06-22T14:30:00Z',
    category: 'resource'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'New Daily Challenge Assigned',
    content: 'Admin assigned: "Invert Binary Tree" (Trees, Easy). Solve before June 26!',
    type: 'challenge',
    createdAt: '2026-06-25T09:05:00Z',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Mock Interview Announcement',
    content: 'Coordinators posted: "Upcoming Mock Technical Interviews" under announcements.',
    type: 'announcement',
    createdAt: '2026-06-24T10:02:00Z',
    read: true
  }
];
