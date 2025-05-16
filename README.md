# Welcome to ninjaChef Agent App

## Project info

**Development**

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone git@github.com:ddewantaraq/ninja-chef.git

# Step 2: Navigate to the project directory.
cd ninja-chef

# Step 3: Copy .env.example to .env.development, fill the required variables.
cp .env.example .env.development

# Step 4: Run docker compose.
docker compose up -d

# Step 5: Install the necessary dependencies.
npm i

# Step 6: Start the development server with auto-reloading and an instant preview.
npm run dev
```