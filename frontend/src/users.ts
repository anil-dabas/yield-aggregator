export interface HardcodedUser {
  username: string;
  password: string;
  walletAddress: string;
  walletBalance: {
    ETH: string;
    SOL: string;
    USDC: string;
  };
}

export const hardcodedUsers: HardcodedUser[] = [
  {
    username: 'user1',
    password: 'password1',
    walletAddress: '0x1111...1111',
    walletBalance: { ETH: '10.0', SOL: '200', USDC: '5000' },
  },
  {
    username: 'user2',
    password: 'password2',
    walletAddress: '0x2222...2222',
    walletBalance: { ETH: '5.0', SOL: '100', USDC: '10000' },
  },
  {
    username: 'user3',
    password: 'password3',
    walletAddress: '0x3333...3333',
    walletBalance: { ETH: '2.0', SOL: '50', USDC: '2000' },
  },
];