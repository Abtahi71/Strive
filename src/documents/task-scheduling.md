# Task Scheduling

## What is Task Scheduling?

Task scheduling determines when a task is expected to be performed.

Tasks can have schedules associated with them.

## TaskSchedule

A TaskSchedule connects a task with a day of the week.

Each schedule contains:

- Task
- Day of week

## Schedule Types

Tasks have a ScheduleType.

The default schedule type is DAILY.

## DAILY Tasks

A DAILY task is expected to be performed every applicable day according to the application's scheduling logic.

## Scheduled Days

A task can have specific scheduled days.

For example, a task might be scheduled for:

- Monday
- Wednesday
- Friday

## Streaks and Scheduling

Streak calculations should consider the task's required schedule.

A day on which a task is not scheduled should not automatically be treated as a missed required day.

The application's streak calculation logic is the final authority.