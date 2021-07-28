export const richLogRenderJs = `const { html, render, useState, createContext, useContext, useMemo } = htmPreact;

function renderToBody(rootProps) {
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

        return html\`<img class="avatar" src=\${avatar ?? './img/noname.png'} />\`;
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

    function FontSizeButtons() {
        const [, setRootState] = useContext(RootStatePairContext);

        const fontSizePlus = () => {
            setRootState(rootState => {
                const { fontSizeDelta } = rootState;
                if (fontSizeDelta >= 3) {
                    return rootState;
                }
                return {
                    ...rootState,
                    fontSizeDelta: fontSizeDelta + 1,
                };
            });
        };
        const fontSizeMinus = () => {
            setRootState(rootState => {
                const { fontSizeDelta } = rootState;
                if (fontSizeDelta <= -3) {
                    return rootState;
                }
                return {
                    ...rootState,
                    fontSizeDelta: fontSizeDelta - 1,
                };
            });
        };

        // svgはAnt Designのアイコン(MIT License)を基に作っている
        return html\`<div class="flex-0 flex flex-row align-items-center font-size-buttons">
            <div>フォントサイズ</div>
            <button type="button" onClick=\${() => fontSizePlus()}>
                <svg width="20" height="20" fill="white" viewBox="64 64 896 896" focusable="false">
                    <defs><style /></defs>
                    <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" />
                    <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z" />
                </svg>
            </button>
            <button type="button" onClick=\${() => fontSizeMinus()}>
                <svg width="20" height="20" fill="white" viewBox="64 64 896 896" focusable="false">
                    <path
                        d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"
                    />
                </svg>
            </button>
        </div>\`;
    }

    function App(props) {
        const { messages } = props;

        const initialRootState = {
            fontSizeDelta: 0,
        };
        const [rootState, setRootState] = useState(initialRootState);
        const rootStatePair = useMemo(() => {
            return [rootState, setRootState];
        }, [rootState, setRootState]);

        return html\`<\${RootStatePairContext.Provider} value=\${rootStatePair}>
            <div class="header flex flex-row">
                <\${FontSizeButtons} />
            </div>
            <div class="container flex flex-column">
                \${messages.map((message, i) => {
                    const { id } = message;
                    return html\`<\${Message} key=\${id ?? i} ...\${message} />\`;
                })}
            </div>
        <//>\`;
    }

    render(html\`<\${App} ...\${rootProps} />\`, document.body);
}
`;