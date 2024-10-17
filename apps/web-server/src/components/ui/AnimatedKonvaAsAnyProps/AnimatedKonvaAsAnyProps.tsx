import { animated } from '@react-spring/konva';

// HACK: animated のメンバーは TypeScript 4.5 以降で Type instantiation is excessively deep and possibly infinite. と誤検知されるため、修正されるまで型検査を無効にしている。 https://github.com/pmndrs/react-spring/issues/1784
export const AnimatedGroupAsAnyProps = animated.Group as any as React.FC<any>;
export const AnimatedImageAsAnyProps = animated.Image as any as React.FC<any>;
export const AnimatedRectAsAnyProps = animated.Rect as any as React.FC<any>;
export const AnimatedTextAsAnyProps = animated.Text as any as React.FC<any>;
