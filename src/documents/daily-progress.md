# Daily Activity Progress

## What is ActivityDailyProgress?

ActivityDailyProgress stores a user's daily performance within an activity.

Each record belongs to:

- One activity
- One user
- One date

## Fields

### completedTasks

The number of tasks completed by the user for that activity on the given date.

### totalTasks

The total number of applicable tasks for the user in that activity on the given date.

### completionPercentage

The percentage of applicable tasks completed.

### completed

Indicates whether the daily activity requirement has been completed according to the application's rules.

## Daily Progress Example

If a user has:

- 5 total tasks
- 4 completed tasks

their completion percentage may be 80%.

The actual stored completionPercentage is the authoritative value.

## Historical Progress

ActivityDailyProgress can be used to analyze a user's activity performance across multiple days.

It can be used to answer questions such as:

- How did I perform this week?
- How many tasks did I complete?
- What was my completion rate?
- Which days did I complete my activity?

## Important

When answering questions about actual user progress, the chatbot should retrieve ActivityDailyProgress from the database instead of relying on this document.