import * as React from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
    loadingPlaceholder: JSX.Element;
};

export const LazyAndPreloadImage: React.FC<Props> = (props: Props) => {
    const { loadingPlaceholder: placeHolderElement, src, ...restProps } = props;
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        if (src == null) {
            return;
        }
        const img = new Image();
        img.src = src;

        // TODO: 取得に失敗したとき（srcが404など）にはloadingPlaceholderから切り替わらないので、エラーの場合のplaceholderにも対応させる
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
