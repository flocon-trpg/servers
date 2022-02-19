import { escape } from 'html-escaper';

export const div = 'div';
export const span = 'span';
type Type = typeof div | typeof span;

export type HtmlObject = {
    type: Type;
    className?: string;
    style?: string;
    children?: string | HtmlObject[];
};

export const generateHtml = ({ type, className, style, children }: HtmlObject) => {
    let childrenAsHtml: string;
    if (children == null || typeof children === 'string') {
        childrenAsHtml = children == null ? '' : escape(children);
    } else {
        childrenAsHtml = '';
        children.forEach(c => {
            childrenAsHtml = `${childrenAsHtml}${generateHtml(c)}`;
        });
    }
    let startTag = type;
    if (className != null) {
        startTag += ` class="${className}"`;
    }
    if (style != null) {
        startTag += ` style="${style}"`;
    }
    return `<${startTag}>${childrenAsHtml}</${type}>`;
};
