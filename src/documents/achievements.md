# Achievements

## What is an Achievement?

An achievement is a goal associated with a task.

Achievements provide additional objectives that users can work toward.

## TaskAchievement

A TaskAchievement belongs to an ActivityTask.

An achievement can contain:

- Title
- Description
- Icon
- Total value
- Unit
- Icon type
- Icon value

## Achievement Progress

UserTaskAchievement stores a user's progress toward an achievement.

It contains:

- User
- Achievement
- isEarned
- completedValue
- completedStreak

## isEarned

isEarned indicates whether the user has earned the achievement.

## completedValue

completedValue represents the user's progress toward a value-based achievement.

## completedStreak

completedStreak represents progress toward a streak-based achievement.

## Achievement Uniqueness

A user can have only one UserTaskAchievement record for a specific achievement.

## Achievement Status

An achievement should be considered earned only when isEarned is true.

The chatbot should use the user's actual achievement record when answering achievement-related questions.