FROM mcr.microsoft.com/dotnet/core/sdk:3.1
RUN apt update && apt install python3 python3-pip -y
RUN pip3 install psutil

WORKDIR /app
COPY . .
WORKDIR /app/Silo

CMD exec python3 dev.py
