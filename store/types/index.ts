export type ChatsType = {
    id: number
    type: "PRIVATE"
    name: string
    user: UserType
    lastMessage: {
        id: 0
        text: string
        sender: UserType
        receiver: UserType
        createdAt: string
    }
    unreadCount: number
}


type UserType = {
    id: number
    fullName: string
    imageUrl: string
}

export type ListMessageType = {
    content: ContentType[]
}

type ContentType = {
    createdAt: string
    id: number
    receiver: UserType
    sender: UserType
    text: string
}