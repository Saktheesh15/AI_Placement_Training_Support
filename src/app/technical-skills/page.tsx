
"use client";
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Loader2 } from 'lucide-react';
import { Container } from '@/components/layout/container';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TechnicalSkillTopicClient } from '@/components/features/technical-skill-topic-client';
import { runCodeAction } from './actions'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Link as LinkIcon, BrainCircuit, DatabaseZap, Binary, Network, Hash, Briefcase, FileCode, Workflow, Shapes, Palette, Layers, GitFork, SigmaSquareIcon, Grid2X2, Puzzle, Cog, Brain as PageIcon } from 'lucide-react'; 
import Link from 'next/link';
import Image from 'next/image';


const interactiveLearningModules = [
  {
    id: "javascript-basics",
    title: "JavaScript Fundamentals",
    difficulty: "Beginner",
    language: "javascript",
    content: "Learn the core concepts of JavaScript, including variables, data types, operators, control flow, functions, and objects. This module provides a solid foundation for web development and problem-solving.",
    codeSnippet: `// Example: Factorial in JavaScript
function factorial(n) {
  if (n < 0) return "Invalid input";
  if (n === 0) return 1;
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

console.log(factorial(5));
/* Expected output:
120
*/`,
  },
  {
    id: "python-syntax", 
    title: "Python Core Concepts",
    difficulty: "Beginner",
    language: "python",
    content: "Grasp Python's syntax, control flow, functions, and built-in data types like lists, dictionaries, tuples, and sets. Essential for scripting, data analysis, and backend development.",
    codeSnippet: `# Example: Python list comprehension
numbers = [1, 2, 3, 4, 5]
squared_evens = [x*x for x in numbers if x % 2 == 0]
print(squared_evens)
# Expected output:
# [4, 16]`,
  },
  {
    id: "react-state-props", 
    title: "React: State & Props",
    difficulty: "Intermediate",
    language: "javascript", 
    content: "Understand fundamental React concepts: components, props for passing data, and state for managing dynamic data within components. Learn how to use the useState hook effectively.",
    codeSnippet: `// Example: useState Hook in React (conceptual)
import React, { useState } from 'react';

function ClickTracker() {
  const [clicks, setClicks] = useState(0);

  return (
    <div>
      <p>Button clicked {clicks} times</p>
      <button onClick={() => setClicks(prevClicks => prevClicks + 1)}>
        Click Me
      </button>
    </div>
  );
}
// This React component displays a click counter.
// If rendered, clicking the button increments and displays the count.`,
  },
  {
    id: "sql-select-joins", 
    title: "SQL: SELECT & JOINs",
    difficulty: "Beginner",
    language: "sql",
    content: "Learn to retrieve data using SELECT statements and combine data from multiple tables using various JOIN clauses (INNER, LEFT, RIGHT, FULL). Fundamental for database interactions.",
    codeSnippet: `-- Example: SQL INNER JOIN
SELECT Orders.OrderID, Customers.CustomerName, Orders.OrderDate
FROM Orders
INNER JOIN Customers ON Orders.CustomerID = Customers.CustomerID
WHERE Customers.City = 'London';
/* 
Expected result (example structure):
OrderID | CustomerName | OrderDate
--------|--------------|-----------
10308   | Alfreds F.   | 1996-09-18
... (other orders from London customers)
*/`,
  },
];

const dataStructuresForInterviews = [
  {
    id: "arrays-strings",
    title: "Arrays & Strings",
    icon: Binary,
    difficulty: "Fundamental",
    language: "generic",
    content: "Arrays are collections of items stored at contiguous memory locations. Strings are sequences of characters. Both are foundational for almost all coding interviews. Master operations like traversal, searching, sorting, and specific string manipulations (substrings, palindromes, anagrams).",
    codeSnippet: `// Array Example (Python): Find max element
def find_max(arr):
  if not arr: return None
  max_val = arr[0]
  for x in arr:
    if x > max_val: max_val = x
  return max_val

// String Example (JavaScript): Check palindrome
function isPalindrome(str) {
  const cleanStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanStr === cleanStr.split('').reverse().join('');
}`
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    icon: Workflow,
    difficulty: "Fundamental",
    language: "generic",
    content: "Linked lists consist of nodes where each node contains data and a pointer to the next node. Crucial for understanding pointers/references and dynamic memory. Common problems: reversal, cycle detection, merging.",
    codeSnippet: `// Conceptual Node for Singly Linked List
class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}
// Operations: insert, delete, search, reverse`
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    icon: Layers, 
    difficulty: "Fundamental",
    language: "generic",
    content: "Stacks (LIFO - Last In, First Out) and Queues (FIFO - First In, First Out) are linear data structures. Used in expression evaluation, BFS/DFS, scheduling. Implementations via arrays or linked lists.",
    codeSnippet: `// Stack operations: push, pop, peek, isEmpty
// Queue operations: enqueue, dequeue, peek, isEmpty

// Example: Stack for balancing parentheses (JS)
function isValid(s) {
    const stack = [];
    const map = { '(': ')', '{': '}', '[': ']' };
    for (let char of s) {
        if (map[char]) {
            stack.push(char);
        } else if (Object.values(map).includes(char)) {
            if (stack.length === 0 || map[stack.pop()] !== char) {
                return false;
            }
        }
    }
    return stack.length === 0;
}`
  },
  {
    id: "hash-tables",
    title: "Hash Tables (Dictionaries/Maps)",
    icon: Hash,
    difficulty: "Crucial",
    language: "generic",
    content: "Hash tables store key-value pairs, offering average O(1) time complexity for lookups, insertions, and deletions. Essential for problems involving frequency counting, caching, and efficient data retrieval.",
    codeSnippet: `// Python Dictionary Example
counts = {}
text = "hello world"
for char in text:
  counts[char] = counts.get(char, 0) + 1
// print(counts) -> {'h': 1, 'e': 1, ...}`
  },
  {
    id: "trees",
    title: "Trees (Binary, BST, Tries)",
    icon: Network, 
    difficulty: "Intermediate",
    language: "generic",
    content: "Hierarchical data structures. Binary Trees, Binary Search Trees (BSTs) for sorted data, Tries for string operations. Traversals (InOrder, PreOrder, PostOrder, LevelOrder/BFS, DFS) are key.",
    codeSnippet: `// Conceptual Binary Tree Node
class TreeNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}
// BST property: node.left.value < node.value < node.right.value`
  },
  {
    id: "graphs",
    title: "Graphs",
    icon: GitFork, 
    difficulty: "Intermediate",
    language: "generic",
    content: "Represent networks of interconnected nodes (vertices) and edges. Algorithms include BFS, DFS, shortest path (Dijkstra, Bellman-Ford), topological sort, and cycle detection. Adjacency lists/matrices for representation.",
    codeSnippet: `// Graph Representation (Adjacency List - Python)
graph = {
  'A': ['B', 'C'],
  'B': ['A', 'D', 'E'],
  'C': ['A', 'F'],
  'D': ['B'],
  'E': ['B', 'F'],
  'F': ['C', 'E']
}
// Common algorithms: BFS, DFS`
  },
  {
    id: "heaps",
    title: "Heaps (Priority Queues)",
    icon: Palette, 
    difficulty: "Intermediate",
    language: "generic",
    content: "Specialized tree-based data structure satisfying the heap property. Min-heaps and Max-heaps are common. Used for implementing priority queues, heapsort, and problems like finding Kth largest/smallest elements.",
    codeSnippet: `// Python's heapq module for min-heap
import heapq
data = [3, 1, 4, 1, 5, 9, 2, 6]
heapq.heapify(data) // transforms list into a heap, in-place
// smallest = heapq.heappop(data)`
  },
];

interface PracticeProblem {
  title: string;
  url?: string;
  source?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

const problemCategories = [
  {
    id: "arrays-and-strings",
    name: "Arrays & Strings",
    icon: Binary,
    problems: [
      { title: "Diamond pattern problems", difficulty: "Easy" },
      { title: "Print numbers without duplication", difficulty: "Easy"},
      { title: "Sort array: odds ascending, evens descending", difficulty: "Medium" },
      { title: "Find extra element and its index", difficulty: "Easy" },
      { title: "Move Zeroes to End of Array", difficulty: "Easy" },
      { title: "Find Element Appears Once", difficulty: "Easy" },
      { title: "Single Number II", url: "https://leetcode.com/problems/single-number-ii/description/", source: "LeetCode", difficulty: "Medium" },
      { title: "Missing Number in Array", difficulty: "Easy"},
      { title: "Reverse string keeping special characters position", difficulty: "Medium"},
      { title: "Kadane’s Algorithm (Max Subarray Sum)", difficulty: "Medium" },
      { title: "Word Break Problem", url: "https://leetcode.com/problems/word-break/", source: "LeetCode", difficulty: "Medium"},
      { title: "Maximum Product of Three Numbers", url: "https://leetcode.com/problems/maximum-product-of-three-numbers/description/", source: "LeetCode", difficulty: "Easy" },
      { title: "Pangram Checking", difficulty: "Easy"},
      { title: "Group Anagrams", url: "https://leetcode.com/problems/group-anagrams/", source: "LeetCode", difficulty: "Medium"},
      { title: "Longest Increasing Subsequence", url: "https://leetcode.com/problems/longest-increasing-subsequence/", source: "LeetCode", difficulty: "Medium" },
      { title: "Print true if second string is a substring of first string, else print false.", difficulty: "Easy" },
      { title: "Sort the array elements in descending order according to their frequency of occurrence", difficulty: "Medium" },
      { title: "Transform String", url:"https://leetcode.com/problems/string-transformation/description/", source:"LeetCode - Similar", difficulty: "Medium"},
      { title: "Decode a string recursively encoded as count followed by substring", difficulty: "Hard"},
      { title: "Given an array of integers of size n. Convert the array in such a way that if next valid number is same as current number, double its value and replace the next number with 0.", difficulty: "Medium"},
      { title: "Given an input string and a dictionary of words, find out if the input string can be segmented into a space-separated sequence of dictionary words", url: "https://leetcode.com/problems/word-break/", source: "LeetCode", difficulty: "Medium"},
      { title: "Given two Strings s1 and s2, remove all the characters from s1 which is present in s2.", difficulty: "Easy"},
      { title: "Find the next greater element for each element in given array.", difficulty: "Medium"},
      { title: "Given a number, find the next smallest palindrome.", difficulty: "Hard"},
      { title: "Given an array with repeated numbers, Find the top three repeated numbers", difficulty: "Medium"},
      { title: "Form the largest possible number using the array of numbers.", difficulty: "Medium"},
      { title: "Lexicographic sorting.", difficulty: "Easy"},
      { title: "Given a set of numbers and a digit in each iteration, if the digit exists in any of  the numbers, remove its occurrences and ask for the next digit till the list becomes empty.", difficulty: "Medium"},
      { title: "Check if a number ‘a’ is present in another number ‘b.", difficulty: "Easy"},
      { title: "Numbers whose sum is closest to zero in an array", difficulty: "Medium"},
      { title: "Find palindrome word in sentences.", difficulty: "Easy"},
      { title: "Given two strings, find the first occurrence of all characters of second string in the first string and print the characters between the least and the highest index", difficulty: "Medium"},
      { title: "Given a range of numbers print the numbers such that they are shuffled", difficulty: "Easy"},
      { title: "Insert 0 after consecutive (K times) of 1 is found", difficulty: "Medium"},
      { title: "To calculate strength of the password string using some predefined rules given in the question", difficulty: "Medium"},
      { title: "Sort parts of an array separately using peak values.", difficulty: "Hard"},
      { title: "Given an input array, find the number of occurrences of a particular number without looping (use hashing)", difficulty: "Easy"},
      { title: "Given an array of characters print the characters that have ‘n’ number of occurrences. If a character appears consecutively it is counted as 1 occurrence", difficulty: "Medium"},
      { title: "Find the second maximum among the given numbers.", difficulty: "Easy"},
      { title: "Given an array of positive numbers. Print the numbers which have longest continuous range.", difficulty: "Medium"},
      { title: "Given two arrays. Find its union.", difficulty: "Easy"},
      { title: "Given an array of numbers and a number k. Print the maximum possible k digit number which can be formed using given numbers.", difficulty: "Hard"},
      { title: "Given an array of numbers and a window of size k. Print the maximum of numbers inside the window for each step as the window moves from the beginning of the array.", difficulty: "Medium"},
      { title: "Given a string, reverse only vowels in it", difficulty: "Easy"},
      { title: "Given sorted array check if two numbers sum in it is a given", difficulty: "Easy"},
      { title: "Given unsorted array find all combination of the element for a given sum.", difficulty: "Medium"},
      { title: "Given an odd length word which should be printed from the middle of the word.", difficulty: "Easy"},
      { title: "Given an array of positive integers. The output should be the number of occurrences of each number.", difficulty: "Easy"},
      { title: "Given an array, find the minimum of all the greater numbers for each element in the array.", difficulty: "Medium"},
      { title: "Find the largest sum contiguous subarray which should not have negative numbers", difficulty: "Medium"},
      { title: "Given a string, we have to reverse the string without changing the position of punctuations and spaces.", difficulty: "Medium"},
      { title: "Given a string, change the order of words in the string (last string should come first).", difficulty: "Easy"},
      { title: "Print longest sequence between same character", difficulty: "Medium"},
      { title: "Check whether a string is a subsequence of another or not.", difficulty: "Medium"},
      { title: "Wildcard Pattern Matching", url:"https://leetcode.com/problems/wildcard-matching/", source:"LeetCode", difficulty: "Hard"},
    ]
  },
  {
    id: "number-theory",
    name: "Number Theory & Bit Manipulation",
    icon: SigmaSquareIcon,
    problems: [
      { title: "Find number of currency notes for amount", url: "https://www.geeksforgeeks.org/find-number-currency-notes-sum-upto-given-amount/", source: "GeeksforGeeks", difficulty: "Easy" },
      { title: "Hexadecimal to Binary conversion", url: "https://www.geeksforgeeks.org/program-to-convert-hexadecimal-number-to-binary/", source: "GeeksforGeeks", difficulty: "Easy" },
      { title: "Binary to Hexadecimal conversion", url: "https://www.geeksforgeeks.org/convert-binary-number-hexadecimal-number/", source: "GeeksforGeeks", difficulty: "Easy" },
      { title: "Find N prime numbers", difficulty: "Easy" },
      { title: "Twisted Prime Number", difficulty: "Medium"},
      { title: "Add Digits", url: "https://leetcode.com/problems/add-digits/description/", source: "LeetCode", difficulty: "Easy" },
      { title: "Find the least prime number that can be added with first array element that makes them divisible by second array elements at respective index", difficulty: "Hard"},
      { title: "Prime factor – sort the array based on the minimum factor they have", difficulty: "Medium"},
      { title: "Find the prime number in the given range. (test cases: interval is negative in range)", difficulty: "Medium"},
      { title: "Adding a digit to all the digits of a number eg digit=4, number = 2875, o/p= 612119", difficulty: "Easy"},
      { title: "Given a large number convert it to the base 7.", difficulty: "Easy"},
    ]
  },
  {
    id: "matrix-problems",
    name: "Matrix / 2D Arrays",
    icon: Grid2X2,
    problems: [
      { title: "Matrix Diagonal Sum", difficulty: "Easy" },
      { title: "Search a string in a 2D matrix", difficulty: "Medium"},
      { title: "Rotate n*n matrix (90, 180, 270 degrees)", difficulty: "Medium" },
      { title: "Matrix Sorting", difficulty: "Medium"},
      { title: "Given two dimensional matrix of integer and print the rectangle can be formed using given indices and also find the sum of the elements in the rectangle", difficulty: "Medium"},
      { title: "Given a two dimensional array which consists of only 0’s and 1’s. Print the matrix without duplication.", difficulty: "Easy"},
      { title: "Search a string in a given 2D matrix.", difficulty: "Medium"},
      { title: "Find the number of rectangles filled with 1s in a matrix", difficulty: "Hard"},
      { title: "Write a program to check if the given words are present in matrix given below.", difficulty: "Medium"},
      { title: "Find the shortest path from one element to another element in a matrix using right and down moves alone.", difficulty: "Medium"},
      { title: "Given a 2D grid of characters, you have to search for all the words in a dictionary by moving only along two directions, either right or down. Print the word if it occurs.", difficulty: "Hard"},
    ]
  },
  {
    id: "recursion-dp",
    name: "Recursion & Dynamic Programming",
    icon: Puzzle,
    problems: [
      { title: "Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/", source: "LeetCode", difficulty: "Easy" },
      { title: "Decode Ways", url: "https://leetcode.com/problems/decode-ways/", source: "LeetCode", difficulty: "Medium" },
      { title: "Let 1 represent ‘A’, 2 represents ‘B’, etc. Given a digit sequence, count the number of possible decodings of the given digit sequence.", url:"https://leetcode.com/problems/decode-ways/", source: "LeetCode - Similar", difficulty: "Medium"},
      { title: "Print all possible words from phone digits", url:"https://leetcode.com/problems/letter-combinations-of-a-phone-number/", source: "LeetCode", difficulty: "Medium"},
      { title: "array of numbers were given to find a number which has same sum of numbers in it’s either side.", difficulty: "Medium"},
      { title: "There are n items each with a value and weight. A sack is filled with the weights. (Knapsack problem)", url:"https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/", source:"GeeksforGeeks", difficulty: "Medium"},
    ]
  },
  {
    id: "trees-graphs",
    name: "Trees & Graphs",
    icon: GitFork,
    problems: [
      { title: "Count possible triangles", url: "https://www.geeksforgeeks.org/problems/count-possible-triangles-1587115620/", source: "GeeksforGeeks", difficulty: "Medium" },
      { title: "Word Ladder", url: "https://www.geeksforgeeks.org/word-ladder-length-of-shortest-chain-to-reach-a-target-word", source: "GeeksforGeeks", difficulty: "Hard" },
      { title: "Given a N*N binary matrix and the co-ordinate points of start and destination, find the number of possible path between them.", difficulty: "Medium"},
      { title: "Number of cells a queen can move with obstacles on chessboard", url:"https://www.geeksforgeeks.org/number-cells-queen-can-move-obstacles-chessborad/", source:"GeeksforGeeks", difficulty: "Hard"},
    ]
  },
  {
    id: "design-misc",
    name: "Design & Miscellaneous",
    icon: Cog,
    problems: [
      { title: "LRU Cache Implementation", url: "https://leetcode.com/problems/lru-cache/", source: "LeetCode", difficulty: "Medium" },
      { title: "Job Sequencing Problem", url: "https://www.geeksforgeeks.org/job-sequencing-problem-set-1-greedy-algorithm/", source: "GeeksforGeeks", difficulty: "Medium" },
      { title: "Validate IP Address", url: "https://leetcode.com/problems/validate-ip-address/", source: "LeetCode", difficulty: "Medium"},
      { title: "Given two dates, find total number of days between them.", difficulty: "Easy"},
      { title: "Given four points, We have to say whether it is square or rectangle or any other shape", difficulty: "Medium"},
      { title: "Given 2 huge numbers as separate digits, store them in array and process them and calculate the sum of 2 numbers and store the result in an array and print the sum.", difficulty: "Easy"},
      { title: "Distinct Permutations of a String", url:"https://www.geeksforgeeks.org/distinct-permutations-string-set-2/", source:"GeeksforGeeks", difficulty: "Medium"},
      { title: "Most Common Word", url:"https://leetcode.com/problems/most-common-word/", source:"LeetCode", difficulty:"Easy"}
    ]
  }
];


export default function TechnicalSkillsPage() {
  const { isLoading: authLoading, authenticatedUser } = useRequireAuth();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  if (!authenticatedUser) return null;


  return (
    <>
    <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <Image
            src="https://placehold.co/600x450.png?text=Technical+Edge"
            alt="Technical Skills Banner"
            layout="fill"
            objectFit="cover"
            data-ai-hint="coding screen interface"
            priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
            <PageIcon className="h-16 w-16 text-white mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Technical Skills Hub
            </h1>
            <p className="mt-4 text-lg text-slate-200 max-w-3xl">
                Build a strong foundation in core technical concepts, data structures, and algorithms. Practice with AI-analyzed code and tackle curated problems to ace your interviews.
            </p>
        </div>
    </div>
    <Container className="py-12">
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-foreground mb-6 flex items-center">
          <BrainCircuit className="mr-3 h-8 w-8 text-primary" /> Interactive Learning Modules
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {interactiveLearningModules.map((topic) => (
            <AccordionItem value={topic.id} key={topic.id} className="border bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <span>{topic.title}</span>
                  <Badge variant={topic.difficulty === 'Beginner' ? 'secondary' : 'default'}>
                    {topic.difficulty}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0">
                <TechnicalSkillTopicClient topic={topic} runCodeAction={runCodeAction} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Separator className="my-10" />

      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-foreground mb-6 flex items-center">
          <DatabaseZap className="mr-3 h-8 w-8 text-primary" /> Data Structures for Interview Success
        </h2>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {dataStructuresForInterviews.map((dsTopic) => {
            const { icon: DsIcon, ...topicProps } = dsTopic; 
            return (
              <AccordionItem value={dsTopic.id} key={dsTopic.id} className="border bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <AccordionTrigger className="p-6 text-lg font-medium hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center">
                      {DsIcon && <DsIcon className="mr-3 h-6 w-6 text-primary/70" />} 
                      {dsTopic.title}
                    </span>
                    <Badge variant={dsTopic.difficulty === 'Fundamental' || dsTopic.difficulty === 'Crucial' ? 'default' : 'secondary'}>
                      {dsTopic.difficulty}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-6 pt-0">
                  <TechnicalSkillTopicClient topic={topicProps as TechTopic} runCodeAction={runCodeAction} />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>
      
      <Separator className="my-10" />

      <section>
        <Card className="shadow-xl rounded-xl border-primary/20 bg-gradient-to-br from-card to-secondary/10">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-foreground flex items-center">
              <ListChecks className="mr-3 h-8 w-8 text-primary" /> Practice Programming Problems
            </CardTitle>
            <CardDescription className="text-md">
              Sharpen your problem-solving skills with this curated list of challenges. Problems are categorized to help you focus your practice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full space-y-3">
              {problemCategories.map((category) => (
                <AccordionItem key={category.id} value={category.id} className="border-0 rounded-lg bg-card shadow-sm">
                  <AccordionTrigger className="px-4 py-3 text-md font-medium hover:no-underline hover:bg-accent/10 rounded-t-lg data-[state=open]:rounded-b-none data-[state=open]:border-b">
                    <div className="flex items-center">
                      <category.icon className="mr-3 h-5 w-5 text-primary/80" />
                      {category.name} ({category.problems.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-2 bg-card rounded-b-lg">
                    <ul className="space-y-2.5">
                      {category.problems.map((problem, index) => (
                        <li key={`${category.id}-${index}`} className="flex items-start p-2.5 bg-secondary/20 rounded-md hover:bg-secondary/40 transition-colors text-sm">
                          <ListChecks className="h-4 w-4 mr-2.5 mt-0.5 text-primary flex-shrink-0" />
                          <div className="flex-grow">
                            <span className="font-medium text-foreground">{problem.title}</span>
                            {problem.source && <Badge variant="outline" className="ml-2 text-xs">{problem.source}</Badge>}
                            {problem.difficulty && <Badge variant={
                                problem.difficulty === "Easy" ? "secondary" : 
                                problem.difficulty === "Medium" ? "default" : "destructive"
                              } className="ml-2 text-xs">{problem.difficulty}</Badge>}
                            {problem.url && (
                              <Link
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-xs text-primary hover:underline inline-flex items-center"
                              >
                                Solve Online <LinkIcon className="h-3 w-3 ml-1" />
                              </Link>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

    </Container>
    </>
  );
}

interface TechTopic {
  id: string;
  title: string;
  difficulty: string;
  language: string;
  content: string;
  codeSnippet: string;
}
