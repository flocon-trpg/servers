// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt#a_stricter_parse_function
export const filterInt = (value: string) => {
    if (/^[-+]?\d+$/.test(value)) {
        return Number(value);
    } else {
        return null;
    }
};
