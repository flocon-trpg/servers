import {
    PieceLogFragment,
    RoomPrivateMessageFragment,
    RoomPublicMessageFragment,
    RoomSoundEffectFragment,
} from '@flocon-trpg/typed-document-node-v0.7.1';
import {
    CustomMessage,
    Message,
    RoomMessage,
    custom,
    pieceLog,
    privateMessage,
    publicMessage,
    soundEffect,
} from './roomMessageTypes';

export class MessageSet<TCustomMessage> {
    #customMessages: CustomMessage<TCustomMessage>[] = [];
    #publicMessages = new Map<string, RoomPublicMessageFragment>();
    #privateMessages = new Map<string, RoomPrivateMessageFragment>();
    #pieceLogs = new Map<string, PieceLogFragment>();
    #soundEffects = new Map<string, RoomSoundEffectFragment>();

    add(message: Message<TCustomMessage>) {
        switch (message.type) {
            case custom:
                this.#customMessages.push(message);
                break;
            case pieceLog:
                this.#pieceLogs.set(message.value.messageId, message.value);
                break;
            case privateMessage:
                this.#privateMessages.set(message.value.messageId, message.value);
                break;
            case publicMessage:
                this.#publicMessages.set(message.value.messageId, message.value);
                break;
            case soundEffect:
                this.#soundEffects.set(message.value.messageId, message.value);
                break;
        }
    }

    // clear() {
    //     this.#customMessages.clear();
    //     this.#pieceLogs.clear();
    //     this.#privateMessages.clear();
    //     this.#publicMessages.clear();
    //     this.#soundEffects.clear();
    // }

    getPrivateMessage(messageId: string) {
        return this.#privateMessages.get(messageId);
    }

    getPublicMessage(messageId: string) {
        return this.#publicMessages.get(messageId);
    }

    get(message: RoomMessage): RoomMessage | undefined {
        switch (message.type) {
            case pieceLog: {
                const value = this.#pieceLogs.get(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: pieceLog,
                    value,
                };
            }
            case privateMessage: {
                const value = this.getPrivateMessage(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: privateMessage,
                    value,
                };
            }
            case publicMessage: {
                const value = this.getPublicMessage(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: publicMessage,
                    value,
                };
            }
            case soundEffect: {
                const value = this.#soundEffects.get(message.value.messageId);
                if (value == null) {
                    return undefined;
                }
                return {
                    type: soundEffect,
                    value,
                };
            }
        }
    }

    values() {
        function* main(self: MessageSet<TCustomMessage>): Generator<Message<TCustomMessage>> {
            for (const value of self.#customMessages.values()) {
                yield value;
            }
            for (const value of self.#pieceLogs.values()) {
                yield {
                    type: pieceLog,
                    value,
                };
            }
            for (const value of self.#privateMessages.values()) {
                yield {
                    type: privateMessage,
                    value,
                };
            }
            for (const value of self.#publicMessages.values()) {
                yield {
                    type: publicMessage,
                    value,
                };
            }
            for (const value of self.#soundEffects.values()) {
                yield {
                    type: soundEffect,
                    value,
                };
            }
        }
        return main(this);
    }
}
