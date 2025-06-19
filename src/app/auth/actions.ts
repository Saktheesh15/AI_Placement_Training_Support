
'use server';

import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';

const USERS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'users.json');
const USER_PERFORMANCE_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'user_performance.json');

const CredentialsSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export type Credentials = z.infer<typeof CredentialsSchema>;

interface User {
  id: string;
  username: string;
  password: string; 
}

// --- Performance Data Types ---
interface SoftSkillEntry {
  topic: string;
  finalScore: number;
  totalQuestions: number;
  date: string;
}

interface AptitudeEntry {
  aptitudeType: string;
  topic?: string;
  score: number;
  date: string;
}

interface InterviewEntry {
  type: string;
  score: number;
  overallFeedback?: string | null;
  date: string;
}

export interface UserPerformanceData {
  softSkillsHistory: SoftSkillEntry[];
  aptitudeHistory: AptitudeEntry[];
  interviewHistory: InterviewEntry[];
  // moduleCompletion could be added here if more detailed tracking is needed
}

const defaultUserPerformanceData: UserPerformanceData = {
  softSkillsHistory: [],
  aptitudeHistory: [],
  interviewHistory: [],
};

// --- User Data Functions ---
async function getUsers(): Promise<User[]> {
  try {
    await fs.mkdir(path.dirname(USERS_FILE_PATH), { recursive: true });
    const data = await fs.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data) as User[];
  } catch (error) {
    // If file doesn't exist or is invalid, return empty array (and create an empty one on save)
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        await saveUsers([]);
        return [];
    }
    console.error("Error reading users.json:", error);
    return [];
  }
}

async function saveUsers(users: User[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(USERS_FILE_PATH), { recursive: true });
    await fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to save users:", error);
    throw new Error("Could not save user data.");
  }
}

// --- User Performance Data Functions ---
async function getAllUserPerformance(): Promise<Record<string, UserPerformanceData>> {
  try {
    await fs.mkdir(path.dirname(USER_PERFORMANCE_FILE_PATH), { recursive: true });
    const data = await fs.readFile(USER_PERFORMANCE_FILE_PATH, 'utf-8');
    return JSON.parse(data) as Record<string, UserPerformanceData>;
  } catch (error) {
     if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        await saveAllUserPerformance({});
        return {};
    }
    console.error("Error reading user_performance.json:", error);
    return {};
  }
}

async function saveAllUserPerformance(allPerformance: Record<string, UserPerformanceData>): Promise<void> {
  try {
    await fs.mkdir(path.dirname(USER_PERFORMANCE_FILE_PATH), { recursive: true });
    await fs.writeFile(USER_PERFORMANCE_FILE_PATH, JSON.stringify(allPerformance, null, 2), 'utf-8');
  } catch (error) {
    console.error("Failed to save user performance data:", error);
    throw new Error("Could not save user performance data.");
  }
}

export async function getUserPerformance(username: string): Promise<UserPerformanceData> {
  const allPerformance = await getAllUserPerformance();
  return allPerformance[username] || { ...defaultUserPerformanceData };
}

export async function updateUserPerformance(
  username: string,
  update: {
    softSkillEntry?: SoftSkillEntry;
    aptitudeEntry?: AptitudeEntry;
    interviewEntry?: InterviewEntry;
  }
): Promise<{ success: boolean; message?: string }> {
  if (!username) return { success: false, message: "Username is required." };

  const allPerformance = await getAllUserPerformance();
  const currentUserPerformance = allPerformance[username] || { ...defaultUserPerformanceData };

  if (update.softSkillEntry) {
    currentUserPerformance.softSkillsHistory.push(update.softSkillEntry);
  }
  if (update.aptitudeEntry) {
    currentUserPerformance.aptitudeHistory.push(update.aptitudeEntry);
  }
  if (update.interviewEntry) {
    currentUserPerformance.interviewHistory.push(update.interviewEntry);
  }

  allPerformance[username] = currentUserPerformance;
  await saveAllUserPerformance(allPerformance);
  return { success: true };
}

export async function resetUserPerformance(username: string): Promise<{ success: boolean; message?: string }> {
  if (!username) return { success: false, message: "Username is required." };
  const allPerformance = await getAllUserPerformance();
  if (allPerformance[username]) {
    allPerformance[username] = { ...defaultUserPerformanceData };
    await saveAllUserPerformance(allPerformance);
    return { success: true, message: "Performance data reset successfully." };
  }
  return { success: false, message: "No performance data found for this user to reset." };
}


// --- Auth Logic ---
export async function signupUser(credentials: Credentials): Promise<{ success: boolean; message: string }> {
  const validation = CredentialsSchema.safeParse(credentials);
  if (!validation.success) {
    return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
  }

  const { username, password } = validation.data;
  const users = await getUsers();

  if (users.find(user => user.username === username)) {
    return { success: false, message: 'Username already exists.' };
  }

  const newUser: User = {
    id: Date.now().toString(),
    username,
    password, 
  };
  users.push(newUser);
  await saveUsers(users);

  // Initialize performance data for the new user
  const allPerformance = await getAllUserPerformance();
  if (!allPerformance[username]) {
    allPerformance[username] = { ...defaultUserPerformanceData };
    await saveAllUserPerformance(allPerformance);
  }

  return { success: true, message: 'Signup successful! You can now log in.' };
}

export async function loginUser(credentials: Credentials): Promise<{ success: boolean; message: string; username?: string }> {
  const validation = CredentialsSchema.safeParse(credentials);
  if (!validation.success) {
    return { success: false, message: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  const { username, password } = validation.data;
  const users = await getUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return { success: false, message: 'Invalid username or password.' };
  }

  if (user.password !== password) {
    return { success: false, message: 'Invalid username or password.' };
  }

  return { success: true, message: 'Login successful!', username: user.username };
}
