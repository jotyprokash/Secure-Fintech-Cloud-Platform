import { Controller, Post, Body, Get, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('merchants')
@UseGuards(AuthGuard('jwt'))
export class MerchantsController {
    constructor(private readonly merchantsService: MerchantsService) { }

    @Post()
    create(@Request() req, @Body() createMerchantDto: CreateMerchantDto) {
        return this.merchantsService.create(req.user.userId, createMerchantDto);
    }

    @Get('my')
    async getMyMerchant(@Request() req) {
        const merchant = await this.merchantsService.findByUser(req.user.userId);
        if (!merchant) throw new NotFoundException('Merchant profile not found');
        return merchant;
    }

    @Post('invoices')
    async createInvoice(@Request() req, @Body() dto: CreateInvoiceDto) {
        const merchant = await this.merchantsService.findByUser(req.user.userId);
        if (!merchant) throw new NotFoundException('Merchant profile not found');
        return this.merchantsService.createInvoice(merchant.id, dto);
    }
}
