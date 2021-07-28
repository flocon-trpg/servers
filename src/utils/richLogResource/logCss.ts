import { Color } from "../color";

export const logCss = `
html {
    background-color: ${Color.chatBackgroundColor};
    color: white;
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

.avatar {
    min-height: 40px;
    height: 40px;
    min-width: 40px;
    width: 40px;
    align-self: center;
    margin-right: 4px;
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
