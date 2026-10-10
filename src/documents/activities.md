# Activities

## What is an Activity?

An Activity is a shared space containing tasks that users can participate in.

An Activity has one creator and can have multiple members.

## Activity Properties

An Activity contains:

- Name
- Description
- Image
- Creator
- Members
- Tasks
- Invitations
- Visibility
- Daily progress

## Activity Creator

The creator is the user who created the activity.

The creator is associated with the activity through the creatorId field.

## Activity Members

Users participate in activities through ActivityMember records.

An activity member has:

- User
- Activity
- Role
- Joined date
- Optional left date
- Active status
- Current streak
- Longest streak
- Completion rate

## Activity Visibility

Activities have a visibility setting.

Visibility determines who can access or discover an activity according to the application's access rules.

## Activity Membership

A user can participate in multiple activities.

An activity can contain multiple users.

The same user cannot have multiple ActivityMember records for the same activity.

## Activity Completion Rate

Activity completion rate represents the user's completion performance within an activity.

The exact value is maintained by the application's progress logic.