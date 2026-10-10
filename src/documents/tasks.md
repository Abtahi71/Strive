# Tasks

## What is a Task?

A task is an activity goal that users are expected to complete.

Every ActivityTask belongs to exactly one Activity.

## Task Properties

A task can contain:

- Name
- Description
- Unit
- Target value
- Task type
- Schedule
- Creator
- Image
- Progress records
- Achievements

## Task Types

Strive currently supports these task types:

- VALUE
- CHECKLIST
- DOWN
- QUIZ

## VALUE

A VALUE task requires the user to enter or achieve a numerical value.

The task has a targetValue and unit.

Example:

Drink 2000 ml of water.

The target value is 2000 and the unit is ml.

## CHECKLIST

A CHECKLIST task represents a task that is completed through checklist-style completion.

## DOWN

DOWN is a task type defined by the application.

The chatbot should follow the application's actual implementation when explaining DOWN tasks.

## QUIZ

A QUIZ task represents a question-based task.

Quiz information includes:

- Question
- Answer
- Options

## Target Value

targetValue represents the target amount required for a task.

## Unit

unit describes what the target value represents.

Examples include:

- minutes
- pages
- kilometers
- liters
- repetitions

## Task Creator

Each task has a creator.

The creator is associated with the task through creatorId.