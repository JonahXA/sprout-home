import { z } from "zod"

/**
 * NOTE:
 * - Base44 used JSON-schema-like "entities".
 * - In this repo we convert them to Zod schemas so they’re actually usable.
 * - IDs are modeled as strings (since Base44 referenced entities by id).
 */

export const AICourseDayProgressSchema = z.object({
 user_email: z.string().email(),
 day_number: z.number(),
 completed: z.boolean().default(false),
 completed_date: z.string().datetime().optional(),
 quiz_score: z.number().optional(),
 activity_completed: z.boolean().default(false),
 time_spent_minutes: z.number().default(0),
})
export const BadgeSchema = z.object({
 name: z.string(),
 description: z.string(),
 icon: z.string().optional(),
 color: z.string().optional(),
 requirement_type: z.enum([
 "streak",
 "lessons_completed",
 "courses_completed",
 "xp_earned",
 "quiz_perfect",
 ]),
 requirement_value: z.number(),
 rarity: z.enum(["Common", "Rare", "Epic", "Legendary"]).default("Common"),
})

export const ChallengeSchema = z.object({
 title: z.string(),
 description: z.string().optional(),
 xp_reward: z.number(),
 challenge_type: z.enum(["daily", "weekly", "milestone"]),
 requirement: z.enum([
 "complete_lesson",
 "earn_xp",
 "complete_quiz",
 "login_streak",
 "complete_course",
 ]),
 requirement_value: z.number().optional(),
 icon: z.string().optional(),
 color: z.string().optional(),
})

export const CourseFinalExamQuestionSchema = z.object({
 question: z.string(),
 options: z.array(z.string()),
 correct_answer: z.number(),
 explanation: z.string().optional(),
})

export const CourseSchema = z.object({
 name: z.string(),
 description: z.string().optional(),
 category: z.enum([
 "Investing",
 "Saving",
 "Credit & Debt",
 "Insurance",
 "AI & ML",
 "Personal Finance",
 "Career Readiness",
 ]),
 difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
 lessons_count: z.number(),
 xp_reward: z.number(),
 image_url: z.string().optional(),
 icon: z.string().optional(),
 color: z.string().optional(),
 is_featured: z.boolean().default(false),
 final_exam_questions: z.array(CourseFinalExamQuestionSchema).optional(),
})

export const CourseCompletionSchema = z.object({
 user_email: z.string().email(),
 course_id: z.string(),
 completed: z.boolean().default(false),
 completed_date: z.string().datetime().optional(),
 final_exam_score: z.number().optional(),
 certificate_url: z.string().optional(),
})

export const DailyActivitySchema = z.object({
 user_email: z.string().email(),
 date: z.string(), // "date" format (YYYY-MM-DD). Keep as string unless you parse.
 lessons_completed: z.number().default(0),
 xp_earned: z.number().default(0),
 time_spent_minutes: z.number().default(0),
})

export const GoalSchema = z.object({
 user_email: z.string().email(),
 title: z.string(),
 description: z.string().optional(),
 target_amount: z.number(),
 current_amount: z.number().default(0),
 target_date: z.string().optional(), // date string
 category: z.enum([
 "Emergency Fund",
 "House Down Payment",
 "Car",
 "Vacation",
 "Education",
 "Other",
 ]),
 color: z.string().optional(),
 completed: z.boolean().default(false),
})

export const LessonQuizQuestionSchema = z.object({
 question: z.string(),
 options: z.array(z.string()),
 correct_answer: z.number(),
 explanation: z.string().optional(),
})

export const LessonSchema = z.object({
 course_id: z.string(),
 title: z.string(),
 content: z.string(),
 order: z.number(),
 duration_minutes: z.number().optional(),
 xp_reward: z.number(),
 quiz_questions: z.array(LessonQuizQuestionSchema).optional(),
})

export const SchoolSchema = z.object({
 name: z.string(),
 location: z.string().optional(),
 type: z.enum(["High School", "College", "University", "Other"]).default("High School"),
 total_students: z.number().default(0),
})

export const UserBadgeSchema = z.object({
 user_email: z.string().email(),
 badge_id: z.string(),
 earned_date: z.string().datetime().optional(),
})

export const UserChallengeSchema = z.object({
 user_email: z.string().email(),
 challenge_id: z.string(),
 progress: z.number().default(0),
 completed: z.boolean().default(false),
 completed_date: z.string().datetime().optional(),
 date: z.string().optional(), // date string
})

export const UserProgressSchema = z.object({
 user_email: z.string().email(),
 lesson_id: z.string(),
 course_id: z.string(),
 completed: z.boolean().default(false),
 completed_date: z.string().datetime().optional(),
 quiz_score: z.number().optional(),
 time_spent_minutes: z.number().optional(),
})

/**
 * Convenience exports: parse helpers
 */
export const Entities = {
 AICourseDayProgress: AICourseDayProgressSchema,
 Badge: BadgeSchema,
 Challenge: ChallengeSchema,
 Course: CourseSchema,
 CourseCompletion: CourseCompletionSchema,
 DailyActivity: DailyActivitySchema,
 Goal: GoalSchema,
 Lesson: LessonSchema,
 School: SchoolSchema,
 UserBadge: UserBadgeSchema,
 UserChallenge: UserChallengeSchema,
 UserProgress: UserProgressSchema,
}
