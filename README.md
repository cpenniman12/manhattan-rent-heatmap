# Manhattan Rent Heat Map

An interactive heat map showing studio apartment rental prices across Manhattan. Colors range from blue/cyan (cheaper, ~$2,500/mo in Harlem) to red/orange (expensive, ~$6,500/mo in Midtown).

![Heat Map Preview](https://via.placeholder.com/800x400?text=Manhattan+Rent+Heat+Map)

## How It Works

1) listings scraped from zillow, stored in supabase 
2) addresses converted to coordinates
3) coordinates placed on map
4) claude,... you finished here 



#Helpful MCPs: 

Supabase - allows for claude code to query DB
Playwright - allows for claude to view rendered front end


tech stack:
- **React 18** + TypeScript
- **Vite** for fast builds
- **Mapbox GL** for map rendering
- **Supabase** for data storage
- **Tailwind CSS** for styling

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template and add your keys
cp .env.example .env

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

Create a `.env` file with:

```
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

- **Mapbox**: Get a free token at [mapbox.com](https://account.mapbox.com/access-tokens/)
- **Supabase**: Create a project at [supabase.com](https://supabase.com)

## Database Schema

The `rentals` table in Supabase:

| Column | Type | Description |
|--------|------|-------------|
| address | text | Street address |
| price | integer | Monthly rent in dollars |
| bedrooms | integer | Number of bedrooms (0 = studio) |
| url | text | Listing URL |

## Project Structure

```
src/
├── App.tsx          # Main app component
├── components/
│   ├── AppShell.tsx # Header and layout
│   └── RentMap.tsx  # Map visualization
├── utils.ts         # Grid generation, address parsing, colors
├── supabase.ts      # Database queries
└── types.ts         # TypeScript types
```

## Key Functions (src/utils.ts)

- `generateManhattanGrid()` - Creates tile grid over Manhattan
- `assignListingsToTiles()` - Maps rentals to tiles by location
- `guessNeighborhoodFromAddress()` - Parses street numbers to estimate latitude
- `getNeighborhood()` - Maps coordinates to neighborhood names

## Acknowledgements

- Web scraping approach inspired by [job_smarts](https://github.com/akhalsa/job_smarts/tree/main/agent) by [@akhalsa](https://github.com/akhalsa)

## License

MIT
