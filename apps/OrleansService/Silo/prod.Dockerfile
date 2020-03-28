FROM mcr.microsoft.com/dotnet/core/sdk:3.1 AS build-env
WORKDIR /src/Silo

COPY ./Silo/Silo.csproj .
RUN dotnet restore

WORKDIR /src
COPY . .

WORKDIR /src/Silo
RUN dotnet publish -c Release -o out
WORKDIR /src/Silo/out
RUN ls -la
CMD exec dotnet Silo.dll