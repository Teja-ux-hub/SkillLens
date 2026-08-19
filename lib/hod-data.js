import dbConnect from "./db";
import User from "@/models/UserModel";

/**
 * Get all students with their progress data
 * In future: add departmentId filter
 */
export async function getStudentsForHOD() {
  try {
    await dbConnect();
    
    const users = await User.find({ 'role.student': true })
      .select('clerkUserId username email firstName lastName college github roadmap assessmentSummary currentTeamId currentProjectId status updatedAt')
      .lean();

    return users.map(user => {
      // Calculate overall progress from roadmap.progress
      const overallProgress = user.roadmap?.progress || 0;
      
      // Get test metrics from assessmentSummary
      const testsCompleted = user.assessmentSummary?.totalCompleted || 0;
      const avgScore = user.assessmentSummary?.averageScore || 0;
      
      // Determine status based on activity and progress
      let status = "Inactive";
      const daysSinceUpdate = user.updatedAt 
        ? Math.floor((Date.now() - new Date(user.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      if (daysSinceUpdate <= 7) {
        if (overallProgress >= 70) status = "Active";
        else if (overallProgress >= 40) status = "On Track";
        else status = "At Risk";
      }

      return {
        userId: user.clerkUserId, // Map to userId for compatibility
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.username || "Unknown",
        email: user.email || user.clerkUserId,
        department: user.college?.departmentId || "N/A",
        roadmap: user.roadmap?.role || "None",
        overallProgress,
        currentStage: user.roadmap?.currentStage || "Not Started",
        testsCompleted,
        avgTestScore: avgScore,
        projectsCompleted: user.currentProjectId ? 1 : 0,
        lastActivity: user.updatedAt || null,
        status,
        githubSummary: user.github?.summary || {},
        currentTeam: user.currentTeamId || null,
        currentProject: user.currentProjectId || null,
        rawData: user
      };
    });
  } catch (error) {
    console.error("Error in getStudentsForHOD:", error);
    throw error;
  }
}

/**
 * Get detailed student data by userId
 * Simplified - only basic profile info
 */
export async function getStudentDetails(userId) {
  try {
    await dbConnect();
    
    // userId parameter is actually clerkUserId
    const user = await User.findOne({ clerkUserId: userId }).lean();
    if (!user) return null;

    return {
      userId: user.clerkUserId,
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.username || "Unknown",
      email: user.email || user.clerkUserId,
      username: user.username,
      githubUsername: user.github?.username,
      githubSummary: user.github?.summary,
      roadmap: user.roadmap,
      assessmentSummary: user.assessmentSummary,
      skills: user.skills,
      currentTeam: user.currentTeamId,
      currentProject: user.currentProjectId,
      department: user.college?.departmentId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  } catch (error) {
    console.error("Error in getStudentDetails:", error);
    throw error;
  }
}

/**
 * Get projects data
 * Currently returns mock structure - to be implemented
 */
export async function getProjectsForHOD() {
  // TODO: Implement when project schema is added
  return [];
}

/**
 * Calculate dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const students = await getStudentsForHOD();
    
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === "Active" || s.status === "On Track").length;
    const studentsWithRoadmaps = students.filter(s => s.roadmap !== "None").length;
    
    const totalProgress = students.reduce((sum, s) => sum + s.overallProgress, 0);
    const avgProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

    const totalTests = students.reduce((sum, s) => sum + s.testsCompleted, 0);
    const totalProjects = students.reduce((sum, s) => sum + s.projectsCompleted, 0);

    return {
      totalStudents,
      activeStudents,
      studentsWithRoadmaps,
      avgProgress,
      totalTests,
      totalProjects,
      students // For detailed views
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    // Return default values if error
    return {
      totalStudents: 0,
      activeStudents: 0,
      studentsWithRoadmaps: 0,
      avgProgress: 0,
      totalTests: 0,
      totalProjects: 0,
      students: []
    };
  }
}
