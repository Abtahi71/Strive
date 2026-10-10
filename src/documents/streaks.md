# Streaks

## What is a Streak?

A streak represents consecutive successful completion of a task or activity requirement.

Strive tracks current streaks and longest streaks.

## Current Streak

currentStreak represents the user's currently active consecutive streak.

## Longest Streak

longestStreak represents the highest streak the user has achieved historically.

## Task Streaks

TaskProgress contains:

- currentStreak
- longestStreak

These values represent streak information for task progress.

## Activity Streaks

ActivityMember also contains:

- currentStreak
- longestStreak

These represent streak information at the activity membership level.

## Missing a Required Day

If a user fails to complete a task on a day when the task is required, the current streak can be broken according to the application's streak logic.

A non-scheduled day should not automatically be treated as a missed completion day.

## Streak Reset

When the current streak is broken, the current streak can return to zero before a new consecutive streak begins.

The longest streak should not be reduced when the current streak resets.

## Important

The chatbot should use actual progress data when answering questions about a user's streak.

It should not calculate or invent a user's streak without the relevant progress records.