import React from 'react';
import { success, useImageFromGraphQL } from '../../hooks/image';
import * as ReactKonva from 'react-konva';
import { animated, useSpring, useTransition } from '@react-spring/konva';
import { RoomPublicMessageFragment } from '@flocon-trpg/typed-document-node';
import { interval } from 'rxjs';
import { isDeleted, toText as toTextCore } from '../../utils/message';
import { FilePath as CoreFilePath } from '@flocon-trpg/core';
import { FilePath } from '../../utils/filePath';
import { PieceGroup, PieceGroupProps } from './PieceGroup';

type BalloonCoreProps = {
    text0?: string;
    text1?: string;
    text2?: string;
    text3?: string;
    text4?: string;
    x: number;
    y: number;
    width: number;
};

// BalloonCoreにおける1つのtextのheight。BalloonCore全体のheightはtextHeight*5になる
const balloonCoreTextHeight = 72;

const BalloonCore: React.FC<BalloonCoreProps> = ({
    text0,
    text1,
    text2,
    text3,
    text4,
    x,
    y,
    width,
}: BalloonCoreProps) => {
    const labelOpacity = 0.8;

    const transitions0 = useTransition(text0, {
        from: { opacity: 0 },
        enter: { opacity: labelOpacity },
        leave: { opacity: 0 },
    });
    const transitions1 = useTransition(text1, {
        from: { opacity: 0 },
        enter: { opacity: labelOpacity },
        leave: { opacity: 0 },
    });
    const transitions2 = useTransition(text2, {
        from: { opacity: 0 },
        enter: { opacity: labelOpacity },
        leave: { opacity: 0 },
    });
    const transitions3 = useTransition(text3, {
        from: { opacity: 0 },
        enter: { opacity: labelOpacity },
        leave: { opacity: 0 },
    });
    const transitions4 = useTransition(text4, {
        from: { opacity: 0 },
        enter: { opacity: labelOpacity },
        leave: { opacity: 0 },
    });

    const createLabel = (textIndex: 0 | 1 | 2 | 3 | 4) => {
        const transitions = [transitions0, transitions1, transitions2, transitions3, transitions4][
            textIndex
        ];
        if (transitions == null) {
            return;
        }
        return transitions((style, item) => {
            return (
                <animated.Group {...style}>
                    {
                        <ReactKonva.Label
                            x={width / 2}
                            y={balloonCoreTextHeight * (textIndex + 1)}
                            width={width}
                            height={balloonCoreTextHeight}
                        >
                            <ReactKonva.Tag
                                strokeWidth={0}
                                fill='#303030'
                                shadowColor='black'
                                shadowBlur={5}
                                shadowOffsetX={5}
                                shadowOffsetY={5}
                                shadowOpacity={0.3}
                                pointerWidth={6}
                                pointerHeight={6}
                                pointerDirection='down'
                                lineJoin='round'
                            />
                            <ReactKonva.Text
                                text={item}
                                fontFamily='Noto Sans JP Regular'
                                fontSize={14}
                                padding={4}
                                fill='white'
                                verticalAlign='middle'
                                width={width}
                                height={balloonCoreTextHeight - 7}
                                wrap='word'
                                ellipsis
                            />
                        </ReactKonva.Label>
                    }
                </animated.Group>
            );
        });
    };

    return (
        <animated.Group x={x} y={y} width={width} height={balloonCoreTextHeight * 5}>
            {createLabel(0)}
            {createLabel(1)}
            {createLabel(2)}
            {createLabel(3)}
            {createLabel(4)}
        </animated.Group>
    );
};

type BalloonProps = {
    message?: RoomPublicMessageFragment;
    x: number;
    y: number;
    width: number;
    onBalloonChange: (balloonExists: boolean) => void;
};

// 💬を表すコンポーネント。
const Balloon: React.FC<BalloonProps> = ({
    message,
    x,
    y,
    width,
    onBalloonChange,
}: BalloonProps) => {
    const onTextsChangeRef = React.useRef(onBalloonChange);
    React.useEffect(() => {
        onTextsChangeRef.current = onBalloonChange;
    }, [onBalloonChange]);

    // indexが小さいほどcreatedAtが大きい(新しい)。
    const [recentMessages, setRecentMessages] = React.useState<
        ReadonlyArray<RoomPublicMessageFragment>
    >([]);

    // 書き込みがあってから💬を画面上にどれだけの期間表示させるか。ただし、サーバーやクライアントの時刻のずれに影響されるため、これらが合っていないと表示期間がゼロになったり短くなったり長くなったりする。
    const timeWindow = 30 * 1000;

    React.useEffect(() => {
        if (message == null) {
            return;
        }

        const now = new Date().getTime();
        setRecentMessages(recentMessages => {
            if (
                recentMessages.some(msg => msg.messageId === message.messageId) ||
                now - message.createdAt > timeWindow
            ) {
                return recentMessages;
            }
            return [...recentMessages, message].sort((x, y) => x.createdAt - y.createdAt);
        });
    }, [message, timeWindow]);

    // このuseEffectで、recentMessagesの要素数が大きくなることで負荷がかかることを防いでいる。
    React.useEffect(() => {
        const unsubscribe = interval(2000).subscribe(() => {
            setRecentMessages(recentMessages => {
                const now = new Date().getTime();
                return [...recentMessages].filter(msg => now - msg.createdAt <= timeWindow);
            });
        });
        return () => unsubscribe.unsubscribe();
    }, [timeWindow]);

    const texts = [...recentMessages]
        .filter(msg => !isDeleted(msg))
        .sort((x, y) => y.createdAt - x.createdAt);

    const toText = (message: RoomPublicMessageFragment | null | undefined): string | undefined => {
        if (message == null) {
            return undefined;
        }
        const text = toTextCore(message);
        if (text == null) {
            return undefined;
        }
        return `${text} ${message.commandResult?.text ?? ''}`;
    };

    const [text0, text1, text2, text3, text4] = [
        toText(texts[4]),
        toText(texts[3]),
        toText(texts[2]),
        toText(texts[1]),
        toText(texts[0]),
    ];

    const [areAllTextsUndefined, setAreAllTextUndefined] = React.useState(
        [text0, text1, text2, text3, text4].every(t => t === undefined)
    );
    React.useEffect(() => {
        setAreAllTextUndefined([text0, text1, text2, text3, text4].every(t => t === undefined));
    }, [text0, text1, text2, text3, text4]);
    React.useEffect(() => {
        onTextsChangeRef.current(!areAllTextsUndefined);
    }, [areAllTextsUndefined]);

    return (
        <BalloonCore
            x={x}
            y={y}
            width={width}
            text0={text0}
            text1={text1}
            text2={text2}
            text3={text3}
            text4={text4}
        />
    );
};

type Props = {
    filePath: FilePath | CoreFilePath;
    opacity: number;

    // (messageFilter(message) ? message : undefined)の値をxとする。xが変わるたび、そのメッセージが💬として表示される。ただし、undefinedになったときは何も起こらない(💬が消えることもない)。
    // 💬を使いたくない場合は常にundefinedにすればよい。
    message?: RoomPublicMessageFragment;

    // undefinedならば(x => true)とみなされる。
    // messageが常にundefinedならばこれもundefinedにしてよい。
    // re-renderのたびに実行されるため、軽量なおかつ副作用のない関数を用いることを強く推奨。
    messageFilter?: (message: RoomPublicMessageFragment) => boolean;
} & PieceGroupProps;

export const ImagePiece: React.FC<Props> = (props: Props) => {
    /*
        リサイズや移動の実装方法についてはこちらを参照
        https://konvajs.org/docs/react/Transformer.html
        */

    const image = useImageFromGraphQL(props.filePath);
    const [opacitySpringProps, setOpacitySpringProps] = useSpring(
        () => ({
            to: {
                opacity: props.opacity,
            },
        }),
        [props.opacity, props.filePath.path, props.filePath.sourceType]
    );
    const imageElement = image.type === success ? image.image : undefined;

    const messageFilterRef = React.useRef(props.messageFilter ?? (() => true));
    React.useEffect(() => {
        messageFilterRef.current = props.messageFilter ?? (() => true);
    }, [props.messageFilter]);

    return (
        <>
            <PieceGroup {...props}>
                <animated.Image
                    {...opacitySpringProps}
                    image={imageElement}
                    x={0}
                    y={0}
                    width={props.w}
                    height={props.h}
                />
            </PieceGroup>
            <Balloon
                x={props.x}
                y={props.y - balloonCoreTextHeight * 5}
                width={props.w}
                message={
                    props.message == null
                        ? undefined
                        : messageFilterRef.current(props.message)
                        ? props.message
                        : undefined
                }
                onBalloonChange={balloonExists => {
                    setOpacitySpringProps.start({
                        opacity: balloonExists ? 1 : props.opacity ?? 1,
                    });
                }}
            />
        </>
    );
};
