# SoftwareEngineeringProject
An Event planning project
First, browse into the OpenFest directory

For the startup of this app we need to create an environment variable for our postgres db password using the following command
$env:DB_PASSWORD = "your-postgres-password"

The project is then compiled with
.\mvnw.cmd compile

The project is run with 
.\mvnw.cmd spring-boot:run

and finally tested with
.\mvnw.cmd test

## Frontend integration

#### Tools needed to build and run

- pnpm ([Find installation instructions here](https://pnpm.io/installation))

#### Setup steps

1. For backend integration, set up the `.env` file using `.env.example`

2. Once `pnmp` is installed, run `pnpm install` inside the `frontend` folder

3. Run the development server using `npm run dev`:

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
