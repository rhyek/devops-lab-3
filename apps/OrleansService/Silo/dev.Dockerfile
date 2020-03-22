FROM mcr.microsoft.com/dotnet/core/sdk:3.1

WORKDIR /src

COPY . .

WORKDIR /src/Silo

CMD exec dotnet watch run
