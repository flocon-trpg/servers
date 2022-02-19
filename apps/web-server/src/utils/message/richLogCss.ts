import { Color } from '../color';
import { Styles } from '../../styles';

export const logCss = `
html {
    background-color: ${Color.chatBackgroundColor};
    color: white;
}

* {
    scrollbar-color: #686868 ${Styles.backgroundColor};
    scrollbar-width: thin;
}
::-webkit-scrollbar {
    background-color: ${Styles.backgroundColor};
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-corner {
    background-color: ${Styles.backgroundColor};
}
::-webkit-scrollbar-thumb {
    background-color: #686868;
}

body {
    margin: 0;
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
    padding: 8px;
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

.flex-none {
    flex: none;
}

.flex-1 {
    flex: 1;
}

.message {
    border-bottom: solid 1px #505050;
    padding: 5px 0;
}
.message.is-command {
    background-color: #FFFFFF10;
}
.message .text {
    white-space: pre-wrap;
}

.avatar {
    align-self: center;
    margin-right: 6px;
    min-height: 40px;
    height: 40px;
    min-width: 40px;
    width: 40px;
}

.name {
    font-weight: bold;
}
`;
