import * as React from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
    placeHolderElement: JSX.Element;
};

export const LazyAndPreloadImage: React.FC<Props> = (props: Props) => {
    const { placeHolderElement, src, ...restProps } = props;
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        if (src == null) {
            return;
        }
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setLoaded(true);
        };
    }, [src]);

    if (src == null) {
        return <img {...restProps} />;
    }

    if (loaded) {
        return <img src={src} {...restProps} />;
    }

    return placeHolderElement;
};
