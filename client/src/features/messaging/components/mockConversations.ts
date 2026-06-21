import type { Conversation } from "./ConversationListItem";

export const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Alice Johnson",
    lastMessage: "Sounds good, see you then!",
    timestamp: "10:42 AM",
    unread: 2,
    participants: [{ firstName: "Alice", lastName: "Johnson", online: true }],
  },
  {
    id: "2",
    name: "Bob Martinez",
    lastMessage: "Can you send me that file?",
    timestamp: "9:15 AM",
    unread: 0,
    participants: [{ firstName: "Bob", lastName: "Martinez", online: false }],
  },
  {
    id: "3",
    name: "Team Alpha",
    lastMessage: "Sprint review is at 3pm.",
    timestamp: "Yesterday",
    unread: 5,
    participants: [
      { firstName: "Alice", lastName: "Johnson", online: true },
      { firstName: "Bob", lastName: "Martinez", online: false },
    ],
  },
  {
    id: "4",
    name: "Clara Nguyen",
    lastMessage: "Thanks, I appreciate it!",
    timestamp: "Yesterday",
    unread: 0,
    participants: [{ firstName: "Clara", lastName: "Nguyen", online: true }],
  },
  {
    id: "5",
    name: "Dev Ops",
    lastMessage: "Deployment went through.",
    timestamp: "Mon",
    unread: 0,
    participants: [
      { firstName: "Dev", lastName: "Ops", online: false },
      { firstName: "Clara", lastName: "Nguyen", online: true },
    ],
  },
];
