# 🃏 Planning Poker

A real-time collaborative Planning Poker application for agile teams. Built with Next.js and Socket.IO, this lightweight tool enables distributed teams to estimate work items together in real-time.

## ✨ Features

- **Real-time Collaboration**: Live updates using Socket.IO for seamless team interaction
- **Multiple Estimation Modes**:
    - 🔢 **Fibonacci**: 0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?
    - 👕 **T-Shirt Sizing**: XS, S, M, L, XL
- **Room-based Sessions**: Create shareable room URLs for team sessions
- **Vote Reveal System**: Moderators can reveal all votes simultaneously
- **Consensus Detection**: Automatic consensus calculation and statistics
- **Dark Mode**: Built-in theme support for comfortable viewing
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **No Authentication Required**: Quick start without signup hassle
- **Custom Avatars**: Fun avatar customization for participants

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Real-time** | Socket.IO v4 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **State Management** | Zustand |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Deployment** | Docker |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd planning-poker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
docker compose up --build
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Manual Docker Build

```bash
docker build -t planning-poker .
docker run -p 3000:3000 planning-poker
```

## 📖 How to Use

1. **Create a Room**: Click "Create Room" on the homepage and enter your name
2. **Share the URL**: Copy and share the room URL with your team
3. **Choose Estimation Mode**: Select between Fibonacci or T-Shirt sizing
4. **Vote**: Each participant selects their estimate card
5. **Reveal**: The moderator reveals all votes to see the consensus
6. **Reset**: Start a new round for the next estimation

## 🏗️ Project Structure

```
planning-poker/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Homepage (create/join room)
│   ├── room/                # Room page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── VotingCards.tsx      # Voting card grid
│   ├── ParticipantList.tsx  # Active participants
│   ├── Consensus.tsx        # Results & statistics
│   └── ...
├── lib/                     # Utilities
│   ├── socket.ts            # Socket.IO client setup
│   ├── types.ts             # TypeScript definitions
│   └── utils.ts             # Helper functions
├── store/                   # State management
│   └── roomStore.ts         # Zustand store
├── pages/api/               # API routes
│   └── socket.ts            # Socket.IO server
├── public/                  # Static assets
├── Dockerfile               # Docker configuration
└── docker-compose.yml       # Docker Compose setup
```

## 🔌 Socket Events

### Client → Server

- `join-room` - Join a room session
- `vote` - Submit or update a vote
- `reveal` - Reveal all votes (moderator only)
- `reset-round` - Start a new voting round
- `change-mode` - Switch between Fibonacci/T-Shirt modes
- `update-avatar` - Update participant avatar

### Server → Client

- `room-state` - Full room state update
- `participant-join` - New participant joined
- `participant-leave` - Participant disconnected
- `votes-revealed` - Votes have been revealed

## 🎯 Consensus Logic

### Fibonacci Mode
- **Consensus**: All votes are equal
- **Statistics**: Shows min, max, average of numeric votes

### T-Shirt Mode
- **Consensus**: Majority vote wins
- **Tie**: No consensus if votes are evenly split

## 🧪 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🔮 Future Enhancements

- [ ] Persistent storage with database integration
- [ ] User authentication and team management
- [ ] Session history and analytics
- [ ] Integration with Jira/GitHub
- [ ] Voting timers
- [ ] Custom card values
- [ ] Export results

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---