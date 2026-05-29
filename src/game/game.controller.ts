import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GameService, SubmitGameDto } from './game.service';

@Controller('games')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  submit(@Body() dto: SubmitGameDto, @Request() req: { user: any }) {
    return this.gameService.submitResult(dto, req.user);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.gameService.getLeaderboard();
  }

  @Get('stats/:userId')
  @UseGuards(AuthGuard('jwt'))
  getUserStats(@Param('userId') userId: string) {
    return this.gameService.getUserStats(userId);
  }
}
