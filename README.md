# InesData FE
## Environment configuration
Before running the frontend, you will need to modify some backend configuration values to point to your InesData connector environment. Those are stored in `.env` file, and
by default contain the following:
```
VITE_APP_BACKEND_API_URL='http://localhost:19193/management'
VITE_APP_KEYCLOAK_ROOT='http://keycloak:8080'
VITE_APP_KEYCLOAK_CLIENTID='dataspace-users'
VITE_APP_KEYCLOAK_REALM='dataspace'
VITE_APP_I18N_LOCALE='EN'
```
## Running locally
To start the FE on your development machine, you will need to execute:
```shell
npm run serve:ui
```
The UI will be available at `http://localhost:8090`
## Build a docker image to execute inside a container
To build the FE, you will need to execute:
```shell
npm run build
```
Then, you can create a Docker image:
```shell
docker build --tag inesdata-fe-app:0.0.1 .
```
Or just run the application locally with:
```shell
docker compose up
```
In this case, the UI will be available at `http://localhost:8090/dataspace/`.
You can change the port on which the application is running, in the `docker-compose.yml` file.