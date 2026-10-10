# Invitations and Friendships

## Activity Invitations

An ActivityInvitation represents an invitation for a user to join an activity.

An invitation contains:

- Activity
- Sender
- Receiver
- Creation date
- Optional expiration date
- Optional accepted date

## Invitation Sender

senderId identifies the user who sent the invitation.

## Invitation Receiver

receiverId identifies the user who receives the invitation.

## Invitation Acceptance

acceptedAt records when an invitation was accepted.

A null acceptedAt indicates that the invitation has not been accepted according to the stored data.

## Invitation Expiration

expiresAt can define when an invitation expires.

## Friendships

Friendship represents a relationship between two users.

A friendship contains:

- Requester
- Receiver
- Status
- Creation date
- Updated date

## Friendship Status

The FriendshipStatus determines the current state of the friendship request.

The chatbot should use the application's actual FriendshipStatus values when explaining a specific friendship.

## Privacy

The chatbot must only provide friendship or invitation information that the authenticated user is authorized to access.