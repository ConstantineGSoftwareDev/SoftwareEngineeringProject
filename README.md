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
