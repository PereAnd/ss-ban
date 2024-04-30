import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const port = 3001;
let valorCompra = 0;
let transferReference = "";
let clientIP = "";

app.use(cors());
app.use(bodyParser.json());

const baseUrl = "https://gw-sandbox-qa.apps.ambientesbc.com/public-partner";

// #region /auth/token
app.post("/auth/token", async (req, res) => {
  let { grant_type, client_id, client_secret, scope } = req.body;
  let auth64 = btoa(`${client_id}:${client_secret}`);
  consolelog({ body: req.body }, "auth/token", "INPUT");
  try {
    let url = baseUrl + "/sb//security/oauth-provider/oauth2/token";
    const formData = new URLSearchParams();
    formData.append("grant_type", grant_type);
    formData.append("scope", scope);
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: "Basic " + auth64,
    };
    const options = {
      method: "POST",
      headers: headers,
      body: formData,
    };
    const response = await fetch(url, options);
    try {
      let responseData = await response.json();
      consolelog(responseData, "auth/token", "OUTPUT");
      res.status(200).send(responseData);
    } catch (e) {
      res.status(500).send({ error: e });
    }
  } catch (e) {
    res.status(500).send({ error: "Servicio Bancolombia no disponible" });
  }
});

// #region /termsConditions
app.get("/termsConditions", async (req, res) => {
  let access_token = req.headers.authorization;
  try {
    let url =
      baseUrl +
      "/sb//v1/operations/product-specific/consumer-services/brokered-product/bancolombiapay-wallet-syncing/terms/retrieveTerms";
    const headers = {
      messageId: "c4e6bd04-5149-11e7-b114-b2f933d5fe66",
      Accept: "application/vnd.bancolombia.v4+json",
      Authorization: "Bearer " + access_token,
      "Content-Type": "application/vnd.bancolombia.v4+json",
    };
    consolelog({ headers: req.headers }, "termsConditions", "INPUT");
    const options = {
      method: "GET",
      headers: headers,
    };
    const response = await fetch(url, options);
    try {
      let responseData = await response.json();
      consolelog(responseData, "termsConditions", "OUTPUT");
      res.status(200).send(responseData);
    } catch (e) {
      res.status(500).send({ error: e });
    }
  } catch (e) {
    res.status(500).send({ error: "Servicio Bancolombia no disponible" });
  }
});

// #region /acceptTermsConditions
app.post("/acceptTermsConditions", async (req, res) => {
  let access_token = req.headers.authorization;
  let aceptacion = req.body.aceptacion;
  consolelog(
    { headers: req.headers, body: req.body },
    "acceptTermsConditions",
    "INPUT"
  );
  try {
    let url =
      baseUrl +
      "/sb//v1/operations/product-specific/consumer-services/brokered-product/bancolombiapay-wallet-syncing/terms/registerTerms";
    let headers = {
      sessionToken: "test",
      messageId: "c4e6bd04-5149-11e7-b114-b2f933d5fe66",
      "Content-Type": "application/vnd.bancolombia.v4+json",
      Accept: "application/vnd.bancolombia.v4+json",
      Authorization: "Bearer " + access_token,
    };
    let body = {
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
    let options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    };
    const response = await fetch(url, options);
    try {
      let responseData = await response.json();
      consolelog(responseData, "acceptTermsConditions", "OUTPUT");
      res.status(200).send(responseData);
    } catch (e) {
      res.status(500).send({ error: e });
    }
  } catch (e) {
    res.status(500).send({ error: e });
  }
});

// #region /transfer-intention
app.post("/transfer-intention", async (req, res) => {
  let access_token = req.headers.authorization;
  let { transferAmount, commerceUrl, transferDescription } = req.body;
  consolelog(
    { headers: req.headers, body: req.body },
    "transfer-intention",
    "INPUT"
  );
  try {
    let url =
      baseUrl +
      "/sb/v3/operations/cross-product/payments/payment-order/transfer/action/registry";
    let headers = {
      "Content-Type": "application/vnd.bancolombia.v4+json",
      Accept: "application/vnd.bancolombia.v4+json",
      Authorization: "Bearer " + access_token,
    };
    let body = {
      data: [
        {
          commerceTransferButtonId: "h4ShG3NER1C", //"VWjl4eeElx",
          transferReference: `REF-${Math.floor(Math.random() * 100000000)}`,
          transferDescription: transferDescription,
          transferAmount: transferAmount,
          commerceUrl: commerceUrl,
          // confirmationURL: `${req.protocol}://${req.get("host")}/test-callback`, //TODO: No funciona con este callback
          confirmationURL:
            "https://pagos-api-dev.tigocloud.net/bancolombia/callback",
        },
      ],
    };
    let options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    };
    consolelog({ headers, body, url, options }, "transfer-intention", "FETCH");
    const response = await fetch(url, options);
    try {
      let responseData = await response.json();
      consolelog(responseData, "transfer-intention", "OUTPUT");
      res.status(200).send(responseData);
    } catch (e) {
      res.status(500).send({ error: e });
    }
  } catch (e) {
    res.status(500).send({ error: e });
  }
});

// #region /transfer-validate
app.get("/transfer-validate/:id", async (req, res) => {
  let access_token = req.headers.authorization;
  let transferCode = req.params.id;
  consolelog(
    { headers: req.headers, transferCode },
    "transfer-validate",
    "INPUT"
  );
  try {
    let url =
      baseUrl +
      `/sb/v3/operations/cross-product/payments/payment-order/transfer/${transferCode}/action/validate`;
    let headers = {
      "Content-Type": "application/vnd.bancolombia.v4+json",
      Accept: "application/vnd.bancolombia.v4+json",
      Authorization: "Bearer " + access_token,
    };
    let options = {
      method: "GET",
      headers: headers,
    };
    const response = await fetch(url, options);
    try {
      let responseData = await response.json();
      consolelog(responseData, "transfer-validate", "OUTPUT");
      res.status(200).send(responseData);
    } catch (e) {
      res.status(500).send({ error: e });
    }
  } catch (e) {
    res.status(500).send({ error: e });
  }
});

// #region Test
app.post("/test-callback", async (req, res) => {
  consolelog(
    { headers: req.headers, body: req.body },
    "test-callback",
    "INPUT"
  );
  res.status(200).send({ message: "Callback recibido" });
});

// #region /consolelog
function consolelog(data, endpoint, type) {
  console.log("_________________" + type + "_________________");
  console.log({ ...data, endpoint, timestamp: new Date() });
  console.log("______________________________________________");
}

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

// #region Anteriores
// app.post("/auth/token", async (req, res) => {
//   let grant_type = req.body.grant_type;
//   let scope =
//     "Product-balance:read:user TermsConditions:read:user TermsConditions-register:write:user Transfer-Intention:read:app Transfer-Intention:write:app";
//   let client_id = req.body.client_id;
//   let client_secret = req.body.client_secret;
//   let auth64 = btoa(`${client_id}:${client_secret}`);
//   clientIP = req.ip || req.socket.remoteAddress;

//   console.log("------------------------------------");
//   console.log({
//     grant_type: grant_type,
//     client_id: client_id,
//     client_secret: client_secret,
//     metadata: {
//       endpoint: "/tokenBancolombia",
//       timestamp: new Date(),
//       clientIP: clientIP,
//     },
//   });
//   try {
//     let url = baseUrl + "/sb//security/oauth-provider/oauth2/token";
//     const formData = new URLSearchParams();
//     formData.append("grant_type", grant_type);
//     formData.append("scope", scope);
//     const headers = {
//       "Content-Type": "application/x-www-form-urlencoded",
//       Accept: "application/json",
//       Authorization: "Basic " + auth64,
//     };
//     const response = await fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: formData,
//     });
//     let responseData = "";
//     try {
//       responseData = await response.json();
//     } catch (e) {
//       responseData = {
//         message: "Servidor Bancolombia no disponible",
//         error: e,
//       };
//     }
//     console.log(responseData);
//     console.log("------------------------------------");

//     res.json(responseData);
//   } catch (e) {
//     res.status(500).send({ error: "Servidor Bancolombia no disponible" });
//   }
// });

// app.get("/termsConditions", async (req, res) => {
//   let access_token = req.headers.authorization;
//   clientIP = req.ip || req.socket.remoteAddress;

//   const headers = {
//     messageId: "c4e6bd04-5149-11e7-b114-b2f933d5fe66",
//     Accept: "application/vnd.bancolombia.v4+json",
//     Authorization: "Bearer " + access_token,
//     "Content-Type": "application/vnd.bancolombia.v4+json",
//   };

//   console.log("------------------------------------");
//   console.log({
//     access_token: access_token,
//     metadata: {
//       endpoint: "/tyc",
//       timestamp: new Date(),
//       clientIP: clientIP,
//     },
//   });
//   try {
//     let url =
//       baseUrl +
//       "/sb//v1/operations/product-specific/consumer-services/brokered-product/bancolombiapay-wallet-syncing/terms/retrieveTerms";

//     const response = await fetch(url, {
//       method: "GET",
//       headers: headers,
//     });
//     let responseData = "";
//     try {
//       responseData = await response.json();
//     } catch (e) {
//       responseData = {
//         message: "Servidor Bancolombia no disponible",
//         error: e,
//       };
//     }
//     console.log(responseData);
//     console.log("------------------------------------");

//     res.json(responseData);
//   } catch (e) {
//     res.status(500).send({ error: "Servidor Bancolombia no disponible" });
//   }
// });

// app.post("/acceptTermsConditions", async (req, res) => {
//   let access_token = req.body.access_token;
//   let aceptacion = req.body.aceptacion;
//   clientIP = req.ip || req.socket.remoteAddress;

//   console.log("------------------------------------");
//   console.log({
//     access_token: access_token,
//     aceptacion: aceptacion,
//     metadata: {
//       endpoint: "/aceptacionTyC",
//       timestamp: new Date(),
//       clientIP: clientIP,
//     },
//   });
//   try {
//     let headers = {
//       sessionToken: "test",
//       messageId: "c4e6bd04-5149-11e7-b114-b2f933d5fe66",
//       "Content-Type": "application/vnd.bancolombia.v4+json",
//       Accept: "application/vnd.bancolombia.v4+json",
//       Authorization: "Bearer " + access_token,
//     };

//     let data = {
//       data: {
//         security: {
//           enrollmentKey: "f",
//         },
//         termsCondition: {
//           clausesCustomer: {
//             acceptance: aceptacion,
//             version: "1",
//           },
//           walletTerms: {
//             acceptance: aceptacion,
//             version: "1",
//           },
//         },
//       },
//     };

//     let url =
//       baseUrl +
//       "/sb//v1/operations/product-specific/consumer-services/brokered-product/bancolombiapay-wallet-syncing/terms/registerTerms";

//     const response = await fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(data),
//     });

//     let responseData = "";
//     try {
//       responseData = await response.json();
//     } catch (e) {
//       responseData = {
//         message: "Servidor Bancolombia no disponible",
//         error: e,
//       };
//     }
//     console.log(responseData);
//     console.log("------------------------------------");

//     res.json(responseData);
//   } catch (e) {
//     res.status(500).send({ error: "Servidor Bancolombia no disponible" });
//   }
// });

// app.post("/transfer-intention", async (req, res) => {
//   let access_token = req.headers.authorization;
//   this.valorCompra = req.body.valorCoxmpra;
//   let commerceUrl = req.body.commerceUrl;
//   transferReference = `REF-${Math.floor(Math.random() * 1000000)}`;
//   clientIP = req.ip || req.socket.remoteAddress;

//   console.log("------------------------------------");
//   console.log({
//     access_token: access_token,
//     valorCompra: this.valorCompra,
//     metadata: {
//       endpoint: "/intencionCompra",
//       timestamp: new Date(),
//       clientIP: clientIP,
//     },
//   });

//   const headers = {
//     "Content-Type": "application/vnd.bancolombia.v4+json",
//     Accept: "application/vnd.bancolombia.v4+json",
//     Authorization: "Bearer " + access_token,
//   };

//   let data = {
//     data: [
//       {
//         commerceTransferButtonId: "h4ShG3NER1C", //"VWjl4eeElx",
//         transferReference: transferReference,
//         transferAmount: this.valorCompra,
//         commerceUrl: commerceUrl,
//         transferDescription: "Compra de productos Cbitbank",
//         confirmationURL:
//           "https://pagos-api-dev.tigocloud.net/bancolombia/callback",
//       },
//     ],
//   };

//   try {
//     let url =
//       baseUrl +
//       "/sb/v3/operations/cross-product/payments/payment-order/transfer/action/registry";

//     const response = await fetch(url, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(data),
//     });

//     let responseData = "";
//     try {
//       responseData = await response.json();
//     } catch (e) {
//       responseData = {
//         message: "Servidor Bancolombia no disponible",
//         error: e,
//       };
//     }
//     console.log(responseData);
//     console.log("------------------------------------");

//     res.json(responseData);
//   } catch (e) {
//     res.status(500).send({ error: "Servidor Bancolombia no disponible" });
//   }
// });

// app.post("/estadoCompra", async (req, res) => {
//   let access_token = req.headers.authorization;
//   let transferCode = req.body.transferCode;
//   clientIP = req.ip || req.socket.remoteAddress;

//   let idTransaccion = Math.floor(Math.random() * 999999) + 1;
//   let idComercio = Math.floor(Math.random() * 999999) + 1;

//   console.log("------------------------------------");
//   console.log({
//     access_token: access_token,
//     metadata: {
//       endpoint: "/estadoCompra",
//       timestamp: new Date(),
//       clientIP: clientIP,
//     },
//   });
//   try {
//     const headers = {
//       "Content-Type": "application/vnd.bancolombia.v4+json",
//       Accept: "application/vnd.bancolombia.v4+json",
//       Authorization: "Bearer " + access_token,
//     };

//     let url =
//       baseUrl +
//       `/sb/v3/operations/cross-product/payments/payment-order/transfer/${transferCode}/action/validate`;

//     const response = await fetch(url, {
//       method: "GET",
//       headers: headers,
//     });

//     let responseData = "";
//     try {
//       responseData = await response.json();
//     } catch (e) {
//       responseData = {
//         message: "Servidor Bancolombia no disponible",
//         error: e,
//       };
//     }
//     console.log(responseData);

//     let estado = responseData["data"]
//       ? responseData["data"][0]["transferState"]
//       : "";
//     let ip = req.ip || req.socket.remoteAddress;
//     if (ip.startsWith("::ffff:")) ip = ip.slice(7);
//     let resp = {
//       transaccion: {
//         idTransaccion: idTransaccion,
//         destinoPago: idComercio,
//         valorCompra: valorCompra,
//         motivo: "Compra de productos",
//         fechaTransaccion: responseData["meta"]
//           ? responseData["meta"]["_requestDate"]
//           : new Date(),
//         numeroAprobacion: responseData["data"]
//           ? responseData["data"][0]["transferVoucher"]
//           : 0,
//         estado: estado,
//         idTransaccionAutorizador: estado == "approved" ? transferReference : "", // transferReference = 'REF-123456'
//         IP: ip,
//         codigoError: responseData["httpCode"] ? responseData["httpCode"] : 0,
//         mensajeError: responseData["httpMessage"]
//           ? responseData["httpMessage"]
//           : "",
//       },
//     };
//     console.log(resp);
//     console.log("------------------------------------");

//     res.json(resp);
//   } catch (e) {
//     res.status(500).send({ error: "Servidor Bancolombia no disponible" });
//   }
// });
