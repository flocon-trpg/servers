"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionManager = exports.pubSub = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.pubSub = new apollo_server_express_1.PubSub();
class InMemoryConnectionManager {
    constructor() {
    }
    onConnectToRoom({}) {
    }
    onWriteStart({}) {
    }
    onLeaveRoom({ connectionId }) {
    }
}
exports.connectionManager = new InMemoryConnectionManager();
