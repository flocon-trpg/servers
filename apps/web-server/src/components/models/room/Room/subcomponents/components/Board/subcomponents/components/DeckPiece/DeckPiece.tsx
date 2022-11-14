import {
    State,
    boardTemplate,
    cardRecordToArray,
    dicePieceStrIndexes,
    dicePieceTemplate,
    dieValueTemplate,
    shapePieceTemplate,
    stringPieceTemplate,
} from '@flocon-trpg/core';
import { keyNames, recordToArray } from '@flocon-trpg/utils';
import { useSpring } from '@react-spring/konva';
import React from 'react';
import * as ReactKonva from 'react-konva';
import { useMouse, usePrevious } from 'react-use';
import { ValueOf } from 'type-fest';
import { DicePieceValue } from '../../../../../utils/dicePieceValue';
import { PixelSize } from '../../../../../utils/positionAndSizeAndRect';
import { StringPieceValue } from '../../../../../utils/stringPieceValue';
import { KonvaD6 } from '../../../../KonvaDice/KonvaDice';
import { PieceGroup, PieceGroupProps } from '../../../../PieceGroup/PieceGroup';
import {
    AnimatedRectAsAnyProps,
    AnimatedTextAsAnyProps,
} from '@/components/ui/AnimatedKonvaAsAnyProps/AnimatedKonvaAsAnyProps';
import { success, useImageFromFilePath } from '@/hooks/imageHooks';
import { useMyUserUid } from '@/hooks/useMyUserUid';

type BoardState = State<typeof boardTemplate>;
type DieValueState = State<typeof dieValueTemplate>;
type DicePieceState = State<typeof dicePieceTemplate>;
type DeckPieceState = NonNullable<ValueOf<NonNullable<BoardState['deckPieces']>>>;
type ShapePieceState = State<typeof shapePieceTemplate>;
type StringPieceState = State<typeof stringPieceTemplate>;

type DeckPieceContentProps = {
    state: DeckPieceState;
} & PixelSize;

const DeckPieceContent: React.FC<DeckPieceContentProps> = ({ state, w, h }) => {
    const r = React.useRef(null);
    const t = useMouse(r);

    const myUserUid = useMyUserUid();
    const x = React.useMemo(() => {
        return cardRecordToArray(state.cards ?? {});
    }, [state]);
    const topCard = x[0];
    const isTopCardRevealed =
        topCard?.value.isRevealed || (myUserUid != null && state.revealedTo.includes(myUserUid));
    const topCardImage = isTopCardRevealed ? topCard?.value.face : topCard?.value.back;

    const image = useImageFromFilePath(topCardImage?.filePath);
    const imageElement = image.type === success ? image.image : undefined;
    return <AnimatedImageAsAnyProps image={imageElement} x={0} y={0} width={w} height={h} />;
};

type Props = {
    state: DeckPieceState;
    opacity: number;
} & PieceGroupProps;

// DicePieceとShapePieceとStringPieceを表示するコンポーネント。これらのPieceはどれもアニメーションがなくコードが単純なため共通化している。
export const DeckPiece: React.FC<Props> = props => {
    return (
        <PieceGroup {...props}>
            <ValueContent {...props} />
        </PieceGroup>
    );
};
