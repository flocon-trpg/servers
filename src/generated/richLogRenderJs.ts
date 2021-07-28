export const richLogRenderJs = `const { html, render, useState, createContext, useContext } = htmPreact;

function renderToBody(param) {
    const RootStatePairContext = createContext();

    function toFontSize(fontSizeDelta) {
        switch (fontSizeDelta) {
            case -3:
                return 10;
            case -2:
                return 11;
            case -1:
                return 12;
            case 0:
                return 14;
            case 1:
                return 16;
            case 2:
                return 19;
            case 3:
                return 22;
            default:
                return 14;
        }
    }

    function Name(message) {
        const [rootState] = useContext(RootStatePairContext);
        const { characterName, userName, textColor } = message;

        const fontSize = toFontSize(rootState.fontSizeDelta);
        const name = characterName ?? userName;

        return html\`
            <div class="name flex-0 flex flex-row" style=\${{ color: textColor, fontSize }}>
                \${name}
            </div>
        \`;
    }

    function Body(message) {
        const [rootState] = useContext(RootStatePairContext);
        const { text } = message;

        const fontSize = toFontSize(rootState.fontSizeDelta);
        return html\`<div class="flex-1" style=\${{ fontSize }}>\${text}</div> \`;
    }

    function Avatar(message) {
        const { avatar } = message;

        return html\`<img class="avatar" src=\${avatar} />\`;
    }

    function Message(message) {
        return html\`<div class="flex flex-row">
            <\${Avatar} ...\${message} />
            <div class="flex flex-column">
                <\${Name} ...\${message} />
                <\${Body} ...\${message} />
            </div>
        </div> \`;
    }

    function App(props) {
        const { messages } = props;

        const initialState = {
            fontSizeDelta: 0,
        };
        const rootStatePair = useState(initialState);

        return html\`<\${RootStatePairContext.Provider} value=\${rootStatePair}>
            <div class="flex flex-column">
                \${messages.map((message, i) => {
                    const { id } = message;
                    return html\`<\${Message} key=\${id ?? i} ...\${message} />\`;
                })}
            <//>
        <//>\`;
    }

    render(html\`<\${App} ...\${param} />\`, document.body);
}
`;