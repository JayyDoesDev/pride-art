<p align="center"><img src="https://github.com/JayyDoesDev/pride-art/blob/main/.github/assets/marie.png" alt="pride-art" width="500"></p>
<h1 align="center">Pride Art (Marie)</h1>
<h2 align="center">🎨 The pride art submission Discord bot for No Text To Speech!</h2>

<div>
    <h2 align="center">
        <img src="https://img.shields.io/github/commit-activity/m/jayydoesdev/pride-art">
        <img src="https://img.shields.io/github/license/jayydoesdev/pride-art">
        <img src="https://img.shields.io/github/languages/top/jayydoesdev/pride-art">
        <img src="https://img.shields.io/github/contributors/jayydoesdev/pride-art">
        <img src="https://img.shields.io/github/last-commit/jayydoesdev/pride-art">
    </h2>
</div>

## Services

- 🤖 **Bot** - The main Discord bot (Node.js)
- 📝 **Redis** - For data storage and caching

## Project Structure

```
.
├── src/
│   ├── classes/      # Core classes
│   ├── handlers/     # Event handlers
│   └── listeners/    # Discord event listeners
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile        # Docker configuration
└── .env              # Environment variables
```

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in required values
3. Choose your preferred setup method:

### Local Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

### Using Docker

The bot can be run using Docker Compose:

```bash
# Build and start all services
docker compose up --build

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

Individual services can be managed with:

```bash
# Start/stop specific service
docker compose up -d [bot|redis]
docker compose stop [bot|redis]
```

## Environment Variables

Required environment variables:

- `BOT_ID` - Discord bot ID
- `PUBLIC_KEY` - Discord bot public key
- `TOKEN` - Discord bot token
- `REDIS_HOST` - Redis host (default: redis)
- `REDIS_PORT` - Redis port (default: 6379)
- `SUBMISSION_CHANNEL_ID` - Channel ID for art submissions
- `VOTE_CHANNEL_ID` - Channel ID for voting

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

<a href="https://github.com/JayyDoesDev/pride-art/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=JayyDoesDev/pride-art" />
</a>
