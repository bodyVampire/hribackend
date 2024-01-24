//@Global Import////////////////
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

//@CORS setup///////////////////
const corsOptions = {
  origin: ["https://digistall.in", /\.digistall\.in$/, /\.localhost:3000$/],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

//@ENV///////////////////////////

const port = 5000;
//@Global Middleware//////////////

app.use(cors(corsOptions));
app.use(bodyParser.json());

//@MongoSetup///////////////////////////////////////////////////////
const mongoDBURL =
  "mongodb+srv://hriDev:plcR3WNQn6iMETa2@hri.gb755zn.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoDBURL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to MongoDB");
});

db.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  });
});
//@Root api////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("Welcome to the home route!");
});
const CustomerSchema = new mongoose.Schema({
  email: {
    type: String,
  },

  name: {
    type: String,
    required: true,
  },
  profilePic: String,
  passwordEnabled: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    default: "",
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  alternateNumber: Number,
  DOB: String,
  gender: String,
  location: String,
  orders: {
    type: [
      {
        orderId: String,
        productId: String,
        gst: Number,
        productImage: String,
        productName: String,
        hasVariants: Boolean,
        size: String,
        onePiecePrice: Number,
        orderNote: {
          deliveryPartner: String,
          ShippingId: String,
          deliveryDate: String,
          deliveryTime: String,
        },
        color: String,
        shopId: String,
        paymentMethod: String,
        productCount: Number,
        totalCartValue: Number,
        orderStatus: { type: String, default: "PENDING" },
        address: String,
        date: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  address: {
    type: Object,
    default: {},
  },
});

const Customer = mongoose.model("Customer", CustomerSchema);

//@API to fetch all shops
app.get("/customer/checkphone", async (req, res) => {
  const { phoneNumber } = req.query;

  try {
    console.log("Querying with phone:", phoneNumber);
    const existingCustomer = await Customer.findOne({ phoneNumber });

    res.json({ exists: !!existingCustomer });
  } catch (error) {
    console.error("Error checking phone number existence", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/customer/checkemail", async (req, res) => {
  const { email } = req.query;

  try {
    const existingCustomer = await Customer.findOne({ email });

    res.json({ exists: !!existingCustomer });
  } catch (error) {
    console.error("Error checking email existence", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/customer/byPhoneNumber", async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const customer = await Customer.findOne({ phoneNumber });

    if (customer) {
      res.status(200).json(customer);
    } else {
      res.status(404).json({ error: "Customer not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//@Starting Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
