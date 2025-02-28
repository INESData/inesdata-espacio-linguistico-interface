# INESData FE
## Prerequisites
Install Node.js (`https://nodejs.org/`) version 18.3 or higher.
### Install dependencies
To install all the packages and dependencies needed, you will need to execute:
```shell
npm install
```
## Environment configuration
Before running the frontend, you will need to modify some backend configuration values to point to your INESData connector environment. Those are stored in `.env` file, and
by default contain the following:
```
VITE_APP_BACKEND_API_URL='http://localhost:19193/management'
VITE_APP_KEYCLOAK_ROOT='http://keycloak:8080'
VITE_APP_KEYCLOAK_CLIENTID='dataspace-users'
VITE_APP_KEYCLOAK_REALM='dataspace'
VITE_APP_I18N_LOCALE='EN'
```
## Running in DEV mode
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
docker build --tag inesdata-fe-app .
```
Or just run the application locally with:
```shell
docker compose up
```
In this case, the UI will be available at `http://localhost:8090/dataspace/`.
You can change the port on which the application is running, in the `docker-compose.yml` file.
## Running 2 instances locally
In case you want to have 2 UI instances running in your local environment, pointing to 2 different connectors, you will need to follow these steps:
### Configure the Connector 1 FE instance:
1) Modify the `.env` file to configure the Connector 1 backend API URL:
```
VITE_APP_BACKEND_API_URL='http://localhost:19193/management'
```
2) Build the FE:
```shell
npm run build
```
3) Create a Docker image for the Connector 1
```shell
docker build --tag inesdata-fe-app-con1 .
```
4) Run the Docker image inside a container
```shell
docker run --name inesdata-con1-fe -p 8090:80 -d inesdata-fe-app-con1
```
At this point, the UI for the Connector 1 will be available at `http://localhost:8090/dataspace/`.
### Configure the Connector 2 FE instance:
1) Modify again the `.env` file to configure the Connector 2 backend API URL:
```
VITE_APP_BACKEND_API_URL='http://localhost:29193/management'
```
2) Build again the FE:
```shell
npm run build
```
3) Create a Docker image for the Connector 2:
```shell
docker build --tag inesdata-fe-app-con2 .
```
4) Run the Docker image inside a container:
```shell
docker run --name inesdata-con2-fe  -p 18090:80 -d inesdata-fe-app-con2
```
At this point, the UI for the Connector 2 will be available at `http://localhost:18090/dataspace/`.