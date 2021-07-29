import { Color } from "../color";

export const logCss = `
html {
    background-color: ${Color.chatBackgroundColor};
    color: white;
}

* {
    scrollbar-color: #686868 #141414;
    scrollbar-width: thin;
}
::-webkit-scrollbar {
    background-color: #141414;
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-corner {
    background-color: #141414;
}
::-webkit-scrollbar-thumb {
    background-color: #686868;
}

body {
    margin: 0;
}

button {
    color: rgba(255, 255, 255, 0.85);
    background: transparent;
    border: 2px solid #434343;
    cursor: pointer;
}
button:hover {
    background: rgba(255, 255, 255, 0.2);
}
button:active {
    background: rgba(255, 255, 255, 0.4);
}

.header {
    background-color: #303030;
    position: fixed;
    top: 0;
    width: 100%;
    height: 50px;
    padding: 0 8px;
}

.container {
    margin-top: 54px;
    padding: 0 8px;
}

.flex {
    display: flex;
}

.flex-row {
    flex-direction: row;
}

.flex-column {
    flex-direction: column;
}

.flex-0 {
    flex: 0 0 auto;
}

.flex-1 {
    flex: 1;
}

.align-items-center {
    align-items: center;
}

.font-size--3 {
    font-size: 10px;
}
.font-size--2 {
    font-size: 11px;
}
.font-size--1 {
    font-size: 12px;
}
.font-size-0 {
    font-size: 14px;
}
.font-size-1 {
    font-size: 16px;
}
.font-size-2 {
    font-size: 19px;
}
.font-size-3 {
    font-size: 22px;
}

.message {
    border-bottom: solid 1px #505050;
    padding: 5px 0;
}

.avatar {
    align-self: center;
    margin-right: 6px;
}
.avatar.font-size--3 {
    min-height: 30px;
    height: 30px;
    min-width: 30px;
    width: 30px;
}
.avatar.font-size--2 {
    min-height: 32px;
    height: 32px;
    min-width: 32px;
    width: 32px;
}
.avatar.font-size--1 {
    min-height: 36px;
    height: 36px;
    min-width: 36px;
    width: 36px;
}
.avatar.font-size-0 {
    min-height: 40px;
    height: 40px;
    min-width: 40px;
    width: 40px;
}
.avatar.font-size-1 {
    min-height: 44px;
    height: 44px;
    min-width: 44px;
    width: 44px;
}
.avatar.font-size-2 {
    min-height: 50px;
    height: 50px;
    min-width: 50px;
    width: 50px;
}
.avatar.font-size-3 {
    min-height: 56px;
    height: 56px;
    min-width: 56px;
    width: 56px;
}

.name {
    font-weight: bold;
}

.font-size-buttons {
    font-size: 12px;
}
.font-size-buttons div {
    margin-right: 2px;
}
`;
