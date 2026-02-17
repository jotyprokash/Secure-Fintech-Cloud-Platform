import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AuthGuard } from '@nestjs/passport';

import { DepositDto } from './dto/deposit.dto';

@Controller('transfers')
@UseGuards(AuthGuard('jwt'))
export class TransfersController {
    constructor(private transfersService: TransfersService) { }

    @Post('deposit')
    deposit(@Body() dto: DepositDto) {
        // In real world, this would be admin only or webhook protected
        return this.transfersService.deposit(dto);
    }

    @Post()
    create(@Request() req, @Body() dto: CreateTransferDto) {
        return this.transfersService.createTransfer(req.user.userId, dto);
    }

    @Get()
    getHistory(@Request() req) {
        return this.transfersService.getTransferHistory(req.user.userId);
    }
}
