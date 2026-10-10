# Task Progress

## What is TaskProgress?

TaskProgress records a user's progress toward a task for a specific date.

Each progress record belongs to:

- One user
- One task
- One activity
- One date

## Progress Fields

### completedValue

completedValue represents how much of the task the user has completed.

### targetSnapshot

targetSnapshot stores the target value associated with the progress record.

It represents the target that applied when that progress record was created.

### isCompleted

isCompleted indicates whether the task requirement has been completed.

### currentStreak

currentStreak represents the user's current consecutive completion streak for the task.

### longestStreak

longestStreak represents the user's highest recorded streak for the task.

## TaskProgressEntry

A TaskProgress can contain multiple progress entries.

Each entry can contain:

- Value
- Optional note
- Creation time

This allows progress to be recorded in multiple entries.

## Progress Uniqueness

A user can have only one TaskProgress record for a specific task and date.

The combination of:

- taskId
- userId
- date

uniquely identifies the progress record.

## Completing a Task

A task is considered completed according to the application's task-specific completion rules.

The chatbot must not assume that completedValue alone always determines completion.

The actual task type and application logic should be considered.