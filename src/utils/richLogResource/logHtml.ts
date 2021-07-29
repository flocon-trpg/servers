export const logHtml = (messageDivs: string[]) => `
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" charset="UTF-8">
<link rel="stylesheet" type="text/css" href="./css/main.css">
</head>
<body>
<div class="container flex flex-column">
${messageDivs.reduce((seed, elem) => (seed === '' ? elem : `${seed}\r\n${elem}`), '')}
</div>
</body>
</html>
`;