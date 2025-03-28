import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}

@Injectable()
export class MessagesWsService {
  private connectedClient: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new Error(`User with id: ${userId} not found`);
    if (!user.isActive) throw new Error('User not active');

    const userAlreadyConnected = Object.values(this.connectedClient).find(
      (cli) => cli.user.id === user.id,
    );

    if (userAlreadyConnected) {
      userAlreadyConnected.socket.disconnect();
      delete this.connectedClient[userAlreadyConnected.socket.id];
    }

    this.connectedClient[client.id] = {
      socket: client,
      user,
    };
  }

  removeClient(clientId: string) {
    delete this.connectedClient[clientId];
  }

  getConnectedClients() {
    return Object.keys(this.connectedClient);
  }

  getAllInfoConnectedClients() {
    return this.connectedClient;
  }
}
