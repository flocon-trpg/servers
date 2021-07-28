export const logHtml = `
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" charset="UTF-8">
<link rel="stylesheet" type="text/css" href="./css/main.css">
</head>
<body>
<script src="./js/htmPreact.js"></script>
<script src="./js/renderToBody.js"></script>
<script src="./js/messages.js"></script>
<script>
renderToBody(messages);
</script>
</body>
</html>
`;