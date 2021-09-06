const fs = require("fs");
const mongodb = require("mongodb");
const JSONSchemaCreator = require("./schema-creator");
const { MongoClient, Binary } = mongodb;

const base64KeyId = "fUV/k/85QiCeB3amaU/9kQ==";
const buffer = Buffer.from(base64KeyId, "base64");
const keyIdBinary = new Binary(buffer, Binary.SUBTYPE_UUID);

const jsonSchemas = JSONSchemaCreator(keyIdBinary); 

const connectionString = "mongodb://localhost:27017/";

const keyVaultNamespace = "encryption.__keyVault";

const path = "./master-key.txt";
const localMasterKey = fs.readFileSync(path);

const kmsProviders = {
  local: {
    key: localMasterKey,
  },
};

const patientSchema = {
  "medicalRecords.patients": jsonSchemas,
};

const extraOptions = {
  mongocryptdURI: "mongodb://localhost:27020",
};

const secureClient = new MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoEncryption: {
    keyVaultNamespace,
    kmsProviders,
    schemaMap: patientSchema,
    extraOptions: extraOptions,
  },
});

async function insertPatient(name, bloodType, ssn) {
  try {
    await secureClient.connect();
    const keyDB = secureClient.db("medicalRecords");
    const collection = keyDB.collection("patients");
    const writeResult = await collection.insertOne({
			name,
      ssn,
      bloodType,
    });
    console.log(writeResult);
  } catch (writeError) {
    console.error("writeError occurred:", writeError);
  }
}

insertPatient(
  'Jon Doe',
  "O+",
  '1234567',
);

async function findPatient() {
  try {
    await secureClient.connect();
    const keyDB = secureClient.db("medicalRecords");
    const collection = keyDB.collection("patients");
    const patient= await collection.find().toArray();
    console.log(patient)
  } catch (readError) {
    console.error("readError occurred:", readError);
  }
}

// findPatient();
