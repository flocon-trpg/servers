import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class IndexOkController {
    @Get('/')
    public index(@Res() res: Response) {
        res.status(HttpStatus.OK).send(`
<html>
    <head>
        <title>Flocon APIサーバー</title>
    </head>
    <h1>Flocon APIサーバー</h1>
    <div>
        <p>
            APIサーバーは稼働しています😊
        </p>
    </div>
</html>
`);
    }
}
