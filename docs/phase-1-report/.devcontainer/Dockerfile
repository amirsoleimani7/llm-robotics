FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

RUN apt-get update && apt-get install -y \
    texlive-xetex \
    texlive-latex-extra \
    texlive-lang-arabic \
    latexmk \
    make \
    python3 \
    tzdata \
    fonts-hosny-amiri \
    fonts-sil-scheherazade \
    fonts-noto-core \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy local Persian fonts (like B Nazanin)
COPY ./fonts/*.TTF /usr/local/share/fonts/

RUN fc-cache -f -v
