const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const { ObjectID } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sbjn6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express()
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static('rent'));
app.use(fileUpload());
const client = new MongoClient(uri, {
  useNewUrlParser: true, useUnifiedTopology:
    true
});
client.connect(err => {
  const apartmentsCollection = client.db("apartmentHunt").collection("apartments");
  const bookingCollection = client.db("apartmentHunt").collection("booking");
  app.post('/addRent', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const location = req.body.location;
    const price = req.body.price;
    const bedrooms = req.body.bedrooms;
    const bathrooms = req.body.bathrooms;
    const description = req.body.description;
    const newImg = file.data;
    const enImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(enImg, 'base64')
    };
    apartmentsCollection.insertOne({ title,price,location,bedrooms,bathrooms,description, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })
  app.get('/rent', (req, res) => {
   apartmentsCollection.find({})
      .toArray((err, document) => {
        res.send(document)
      })
  })
  app.get('/rents/:id', (req, res) => {
    const id = req.params.id;
    apartmentsCollection.find({ _id: ObjectID(id) })
      .toArray((err, document) => {
        res.send(document[0])
        console.log(document[0])
      })
  })
  app.post('/addBooking', (req, res) => {
    const booking = req.body;
    bookingCollection.insertOne(booking)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
  app.get('/booking', (req, res) => {
    bookingCollection.find({ email: req.query.email })
      .toArray((err, document) => {
        res.send(document)
      })
  })
  app.get('/bookingList', (req, res) => {
    bookingCollection.find({})
      .toArray((err, document) => {
        res.send(document)
      })
  })
//   app.patch("/update/:id", (req, res) => {
//     console.log(req.params.id)
//     ordersCollection.updateOne({ _id: (req.params.id) },
//       {
//         $set: { status: req.body.status }
//       }
//     )
//       .then(result => {
//         console.log(result)
//       })
//   })
});
app.listen(process.env.PORT || 5000)