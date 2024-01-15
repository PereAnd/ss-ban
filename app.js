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
  let scope = "Product-balance:read:user TermsConditions:read:user TermsConditions-register:write:user";
  let client_id = req.body.client_id;
  let client_secret = req.body.client_secret;
  let auth64 = btoa(`${client_id}:${client_secret}`);

  console.log({
    'endpoint': '/tokenBancolombia',
    'grant_type': grant_type,
    'client_id': client_id,
    'client_secret': client_secret
  })

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

  console.log({
    'endpoint': '/tyc',
    'access_token': access_token
  })

  let url =
    baseUrl +
    "/sb//v1/operations/product-specific/consumer-services/brokered-product/bancolombiapay-wallet-syncing/terms/retrieveTerms";

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  const responseData = await response.json();

  res.json(responseData);
});

app.post("/aceptacionTyC", async (req, res) => {
  let access_token = req.body.access_token;
  let aceptacion = req.body.aceptacion;

  console.log({
    'endpoint': '/aceptacionTyC',
    'access_token': access_token,
    'aceptacion': aceptacion
  })
  let headers = {
    sessionToken: "test",
    messageId: "c4e6bd04-5149-11e7-b114-b2f933d5fe66",
    "Content-Type": "application/vnd.bancolombia.v4+json",
    "Accept": "application/vnd.bancolombia.v4+json",
    Authorization: "Bearer " + access_token
  };

  let data = {
    "data": {
      "security": {
        "enrollmentKey": "f"
      },
      "termsCondition": {
        "clausesCustomer": {
          "acceptance": aceptacion,
          "version": "1"
        },
        "walletTerms": {
          "acceptance": aceptacion,
          "version": "1"
        }
      }
    }
  }

  let url =
    baseUrl +
    "/sb//v1/operations/product-specific/consumer-services/brokered-product/bancolombiapay-wallet-syncing/terms/registerTerms";

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  res.json(responseData);
});

app.post("/saldoCuenta", async (req, res) => {
  let access_token = req.body.access_token;

  console.log({
    'endpoint': '/saldoCuenta',
    'access_token': access_token
  })
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

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
