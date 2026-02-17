import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletsService } from './wallets.service';

@Controller('wallets')
@UseGuards(AuthGuard('jwt'))
export class WalletsController {
    constructor(private walletsService: WalletsService) { }

    @Get()
    getUserWallets(@Request() req) {
        return this.walletsService.getUserWallets(req.user.userId);
    }
}
