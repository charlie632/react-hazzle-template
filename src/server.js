import App from "./App";
import React, { Fragment } from "react";
import { StaticRouter } from "react-router-dom";
import express from "express";
import { renderToString } from "react-dom/server";
import { Helmet } from "react-helmet";
import { ServerStyleSheet, ThemeProvider } from "styled-components";
import theme from "./Utils/theme";
import Global from "./Utils/global-styles";
// import { ApolloProvider } from "react-apollo";

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

const server = express();
server
  .disable("x-powered-by")
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get("/*", (req, res) => {
    const sheet = new ServerStyleSheet();
    const Root = () => (
      <ThemeProvider theme={theme["LIGHT"]}>
        <StaticRouter context={context} location={req.url}>
          <Fragment>
            <App />
            <Global />
          </Fragment>
        </StaticRouter>
      </ThemeProvider>
    );
    const context = {};

    // When the app is rendered collect the styles that are used inside it
    const markup = renderToString(sheet.collectStyles(<Root />));

    // Generate all the style tags so they can be rendered into the page
    const styleTags = sheet.getStyleTags();
    const helmet = Helmet.renderStatic();

    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(
        `<!doctype html>
    <html lang="" ${helmet.htmlAttributes.toString()}>
    <head>
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${helmet.link.toString()}
        ${styleTags}
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta charset="utf-8" />
        <title>Welcome to Razzle</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        ${assets.client.css ? `<link rel="stylesheet" href="${assets.client.css}">` : ""}
        ${
          process.env.NODE_ENV === "production"
            ? `<script src="${assets.client.js}" defer></script>`
            : `<script src="${assets.client.js}" defer crossorigin></script>`
        }
    </head>
    <body ${helmet.bodyAttributes.toString()}>
        <div id="root">${markup}</div>
    </body>
</html>`
      );
    }
  });

export default server;
