Dashup Module Board
&middot;
[![Latest Github release](https://img.shields.io/github/release/dashup/module-board.svg)](https://github.com/dashup/module-board/releases/latest)
=====

A connect interface for board on [dashup](https://dashup.io).

## Contents
* [Get Started](#get-started)
* [Connect interface](#connect)

## Get Started

This board connector adds boards functionality to Dashup boards:

```json
{
  "url" : "https://dashup.io",
  "key" : "[dashup module key here]"
}
```

To start the connection to dashup:

`npm run start`

## Deployment

1. `docker build -t dashup/module-board .`
2. `docker run -d -v /path/to/.dashup.json:/usr/src/module/.dashup.json dashup/module-board`