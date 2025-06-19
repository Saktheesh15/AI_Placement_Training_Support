
'use server';

import { 
    getUserPerformance, 
    resetUserPerformance as resetUserPerformanceDataAuth,
    type UserPerformanceData
} from '@/app/auth/actions';

export async function getMyPerformanceData(username: string): Promise<UserPerformanceData | { error: string }> {
  if (!username) {
    return { error: "User not identified. Please log in." };
  }
  try {
    const performanceData = await getUserPerformance(username);
    return performanceData;
  } catch (e) {
    console.error("Error fetching performance data for dashboard:", e);
    return { error: "Could not load your performance data." };
  }
}

export async function resetMyPerformanceData(username: string): Promise<{ success: boolean; message: string }> {
  if (!username) {
    return { success: false, message: "User not identified. Please log in." };
  }
  try {
    const result = await resetUserPerformanceDataAuth(username);
    if (result.success) {
      return { success: true, message: "Your dashboard statistics have been reset." };
    }
    return { success: false, message: result.message || "Failed to reset statistics." };
  } catch (e) {
    console.error("Error resetting performance data for dashboard:", e);
    return { success: false, message: "An error occurred while resetting your statistics." };
  }
}
