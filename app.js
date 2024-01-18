import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const baseUrl = "https://gw-sandbox-qa.apps.ambientesbc.com/public-partner";

app.post("/tokenBancolombia", async (req, res) => {
  let grant_type = req.body.grant_type;
  let scope =
    "Product-balance:read:user TermsConditions:read:user TermsConditions-register:write:user Transfer-Intention:read:app Transfer-Intention:write:app";
  let client_id = req.body.client_id;
  let client_secret = req.body.client_secret;
  let auth64 = btoa(`${client_id}:${client_secret}`);

  console.log('------------------------------------');
  console.log({
    endpoint: "/tokenBancolombia",
    timestamp: new Date(),
    grant_type: grant_type,
    client_id: client_id,
    client_secret: client_secret,
  });

  let url = baseUrl + "/sb//security/oauth-provider/oauth2/token";
  const formData = new URLSearchParams();
  formData.append("grant_type", grant_type);
  formData.append("scope", scope);
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
    Authorization: "Basic " + auth64,
  };
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: formData,
  });

  const responseData = await response.json();
  console.log(responseData);
  console.log('------------------------------------');

  res.json(responseData);
});

app.post("/tyc", async (req, res) => {
  let access_token = req.body.access_token;

  const headers = {
    messageId: "c4e6bd04-5149-11e7-b114-b2f933d5fe66",
    Accept: "application/vnd.bancolombia.v4+json",
    Authorization: "Bearer " + access_token,
    "Content-Type": "application/vnd.bancolombia.v4+json",
  };

  console.log('------------------------------------');
  console.log({
    endpoint: "/tyc",
    timestamp: new Date(),
    access_token: access_token,
  });

  let url =
    baseUrl +
    "/sb//v1/operations/product-specific/consumer-services/brokered-product/bancolombiapay-wallet-syncing/terms/retrieveTerms";

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  const responseData = await response.json();
  console.log(responseData);
  console.log('------------------------------------');

  res.json(responseData);
});

app.post("/aceptacionTyC", async (req, res) => {
  let access_token = req.body.access_token;
  let aceptacion = req.body.aceptacion;

  console.log('------------------------------------');
  console.log({
    endpoint: "/aceptacionTyC",
    timestamp: new Date(),
    access_token: access_token,
    aceptacion: aceptacion,
  });
  let headers = {
    sessionToken: "test",
    messageId: "c4e6bd04-5149-11e7-b114-b2f933d5fe66",
    "Content-Type": "application/vnd.bancolombia.v4+json",
    Accept: "application/vnd.bancolombia.v4+json",
    Authorization: "Bearer " + access_token,
  };

  let data = {
    data: {
      security: {
        enrollmentKey: "f",
      },
      termsCondition: {
        clausesCustomer: {
          acceptance: aceptacion,
          version: "1",
        },
        walletTerms: {
          acceptance: aceptacion,
          version: "1",
        },
      },
    },
  };

  let url =
    baseUrl +
    "/sb//v1/operations/product-specific/consumer-services/brokered-product/bancolombiapay-wallet-syncing/terms/registerTerms";

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  console.log(responseData);
  console.log('------------------------------------');

  res.json(responseData);
});

app.post("/saldoCuenta", async (req, res) => {
  let access_token = req.body.access_token;

  console.log({
    endpoint: "/saldoCuenta",
    timestamp: new Date(),
    access_token: access_token,
  });
  let url =
    baseUrl +
    "/sb//v1/operations/product-specific/consumer-services/brokered-product/bancolombiapay-wallet-information/wallet-balance/retrieveBalance";

  const headers = {
    Accept: "application/vnd.bancolombia.v4+json",
    messageId: "fe21b87b-ebdf-4d54-89b5-3eb4312106b3",
    IP: "1.1.1.1",
    deviceId: "123456789",
    strongAuthentication: true,
    "Content-Type": "application/vnd.bancolombia.v4+json",
    "Accept-Encoding": "gzip, deflate, br",
    Authorization: "Bearer " + access_token,
  };

  const data = {
    data: {
      customer: {
        relationship: {
          number: "123456789",
        },
      },
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  res.json(responseData);
});

app.post("/intencionCompra", async (req, res) => {
  let access_token = req.headers.access_token;
  let valorCompra = req.body.valorCompra;

  console.log('------------------------------------');
  console.log({
    endpoint: "/intencionCompra",
    timestamp: new Date(),
    access_token: access_token,
    valorCompra: valorCompra,
  });

  const headers = {
    "Content-Type": "application/vnd.bancolombia.v4+json",
    Accept: "application/vnd.bancolombia.v4+json",
    Authorization: "Bearer " + access_token,
  };

  let data = {
    data: [
      {
        commerceTransferButtonId: "h4ShG3NER1C",
        transferReference: `REF-${Math.floor(Math.random() * 1000000)}`,
        transferAmount: valorCompra,
        commerceUrl: "https://gateway.com/payment/route?commerce=Telovendo",
        transferDescription: "Compra de productos Cbitbank",
        confirmationURL:
          "https://pagos-api-dev.tigocloud.net/bancolombia/callback",
      },
    ],
  };

  let url =
    baseUrl +
    "/sb/v3/operations/cross-product/payments/payment-order/transfer/action/registry";

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });

  const responseData = await response.json();
  console.log(responseData);
  console.log('------------------------------------');

  res.json(responseData);
});

app.post("/estadoCompra", async (req, res) => {
  let access_token = req.headers.access_token;
  let transferCode = req.body.transferCode;

  console.log('------------------------------------');
  console.log({
    endpoint: "/estadoCompra",
    timestamp: new Date(),
    access_token: access_token,
  });

  const headers = {
    "Content-Type": "application/vnd.bancolombia.v4+json",
    Accept: "application/vnd.bancolombia.v4+json",
    Authorization: "Bearer " + access_token,
  };

  let url =
    baseUrl +
    `/sb/v3/operations/cross-product/payments/payment-order/transfer/${transferCode}/action/validate`;

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  const responseData = await response.json();
  console.log(responseData);
  console.log('------------------------------------');
  res.json(responseData);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
