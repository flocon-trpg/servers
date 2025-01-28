import { graphql } from '../graphql-codegen';

export const GetLogDoc = graphql(`
    query GetLog($roomId: String!) {
        result: getLog(roomId: $roomId) {
            __typename
            ... on RoomMessages {
                publicMessages {
                    altTextToSecret
                    messageId
                    textColor
                    updatedAt
                    isSecret
                    updatedText {
                        currentText
                        updatedAt
                    }
                    channelKey
                    character {
                        image {
                            path
                            sourceType
                        }
                        image {
                            path
                            sourceType
                        }
                        isPrivate
                        name
                        portraitImage {
                            path
                            sourceType
                        }
                        stateId
                    }
                    commandResult {
                        text
                        isSuccess
                    }
                    createdAt
                    createdBy
                    customName
                }
                privateMessages {
                    messageId
                    visibleTo
                    initText
                    initTextSource
                    updatedText {
                        currentText
                        updatedAt
                    }
                    textColor
                    commandResult {
                        text
                        isSuccess
                    }
                    altTextToSecret
                    isSecret
                    createdBy
                    character {
                        image {
                            path
                            sourceType
                        }
                        image {
                            path
                            sourceType
                        }
                        isPrivate
                        name
                        portraitImage {
                            path
                            sourceType
                        }
                        stateId
                    }
                    customName
                    createdAt
                    updatedAt
                }
                pieceLogs {
                    messageId
                    stateId
                    createdAt
                    logType
                    valueJson
                }
                publicChannels {
                    key
                    name
                }
                soundEffects {
                    createdAt
                    createdBy
                    file {
                        path
                        sourceType
                    }
                    messageId
                    volume
                }
            }
            ... on GetRoomLogFailureResult {
                failureType
            }
        }
    }
`);
