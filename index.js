require("dotenv").config();
const express = require("express");
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aoxwnlj.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());


const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: "Unauthorized Access" })
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: "Unauthorized Access" })
        }
        req.decoded = decoded;
        next()
    })
}


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {


    try {
        const productCollection = client.db("takeALot").collection("allProducts");
        const categoryListCollection = client.db("takeALot").collection("categoryList");
        const countryListCollection = client.db("takeALot").collection("countryList");
        const usersCollection = client.db("takeALot").collection("users");

        // JWT
        app.post("/jwt", async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: "6h" })
            res.send({ token })
        })


        app.get("/total-products", async (req, res) => {
            const result = await productCollection.estimatedDocumentCount();
            res.send({ totalProduct: result });
        })

        app.get("/all-category", async (req, res) => {
            const result = await categoryListCollection.find({}).toArray();
            res.send(result)
        })
        app.get("/all-country-code", async (req, res) => {
            const result = await countryListCollection.find({}).toArray();
            res.send(result)
        })

        // Houses Collection
        app.get("/all-products", async (req, res) => {
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const skip = page * limit;
            // const queryParams = req.query;

            const products = await productCollection.find({}).skip(skip).limit(limit).toArray();
            res.send(products)


        })


        // users api
        app.post("/users", async (req, res) => {
            const newData = req.body;
            const password = newData.password;
            const hashedPassword = await bcrypt.hash(password, 10);
            // console.log(newUser);
            const newUser = { email: newData?.email, firstName: newData?.firstName, lastName: newData?.lastName, countryCode: newData?.countryCode, phone: newData?.phone, password: hashedPassword, agreeWithNewslettersReceive: newData?.agreeWithNewslettersReceive }

            const email = { email: newData.email };
            const existUser = await usersCollection.findOne(email);
            if (existUser) {
                return res.json("User Exist!")
            } else {
                const result = await usersCollection.insertOne(newUser);
                return res.send(result);
            }
        })

        app.get("/user", verifyJWT, async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            if (query) {
                const result = await usersCollection.findOne(query);
                // console.log(result);
                res.send(result)
            }
        })

        app.patch("/user-password-update/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const existsUser = await usersCollection.findOne(filter);
           
            if (existsUser) {
                // console.log(newResult);
                const newResult = req.body;
                const hashedPassword = await bcrypt.hash(newResult?.password, 10);
                const updateResult = {
                    $set: {
                        password: hashedPassword
                    }
                }
                const result = await usersCollection.updateOne(filter, updateResult);
                return res.send(result);
            }
            else {
                return res.json({ message: "Failed to update password" })
            }

        })

        app.patch("/user-email-update/:id", async (req, res) => {
            // const user = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const existsUser = await usersCollection.findOne(filter);

            // const isValidPass = await bcrypt.compare(existsUser?.password, user.password);

            if (existsUser) {
                // console.log(newResult);
                const newResult = req.body;
                const updateResult = {
                    $set: {
                        email: newResult?.email
                    }
                }
                const result = await usersCollection.updateOne(filter, updateResult);
                return res.send(result);
            }
            else {
                return res.json({ message: "Failed to update email" })
            }

        })


        app.patch("/user-name-update/:id", async (req, res) => {
            // const user = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const existsUser = await usersCollection.findOne(filter);

            // const isValidPass = await bcrypt.compare(existsUser?.password, user.password);

            if (existsUser) {
                // console.log(newResult);
                const newResult = req.body;
                const updateResult = {
                    $set: {
                        firstName: newResult?.firstName,
                        lastName: newResult?.lastName
                    }
                }
                const result = await usersCollection.updateOne(filter, updateResult);
                return res.send(result);
            }
            else {
                return res.json({ message: "Failed to update name" })
            }

        })

        app.patch("/user-phone-number-update/:id", async (req, res) => {
            // const user = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const existsUser = await usersCollection.findOne(filter);

            // const isValidPass = await bcrypt.compare(existsUser?.password, user.password);

            if (existsUser) {
                // console.log(newResult);
                const newResult = req.body;
                const updateResult = {
                    $set: {
                        countryCode: newResult?.countryCode,
                        phone: newResult?.number
                    }
                }
                const result = await usersCollection.updateOne(filter, updateResult);
                return res.send(result);
            }
            else {
                return res.json({ message: "Failed to update name" })
            }

        })

        app.patch("/user-business-details-update/:id", async (req, res) => {
            // const user = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const existsUser = await usersCollection.findOne(filter);

            // const isValidPass = await bcrypt.compare(existsUser?.password, user.password);

            if (existsUser) {
                // console.log(newResult);
                const newResult = req.body;
                const updateResult = {
                    $set: {
                        businessName: newResult?.businessName,
                        vatNumber: newResult?.vatNumber
                    }
                }
                const result = await usersCollection.updateOne(filter, updateResult);
                return res.send(result);
            }
            else {
                return res.json({ message: "Failed to update name" })
            }

        })

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Server successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send("Takealot Server is running");
})

app.listen(port, () => {
    console.log(`This app listening at port ${port}`);
})